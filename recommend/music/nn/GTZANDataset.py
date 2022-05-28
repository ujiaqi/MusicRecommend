import torch
import torch.nn.functional as F
from torch.utils.data import Dataset
import torchaudio
import pandas as pd
import os
import matplotlib.pyplot as plt

# 处理数据集的类 将音频数据转化为张量 同时让每个音频数据都要保持相同的输入状态
class GTZANDataset(Dataset):

    def __init__(self,
                 annotations_file,
                 audio_dir,
                 transformation,
                 target_sample_rate,
                 num_samples,
                 device):
        # 读取标签文件
        self.annotations = pd.read_csv(annotations_file)
        # 读取音频地址
        self.audio_dir = audio_dir
        # 设置设备
        self.device = device
        # 加梅尔频谱数据加载到设备中
        self.transformation = transformation.to(self.device)
        # 设定采样频率
        self.target_sample_rate = target_sample_rate
        # 设定采样数量
        self.num_samples = num_samples

    # 返回有多少个音频文件
    def __len__(self):
        return len(self.annotations)

    # 数组的方式可获得音频的数据、标签、路径
    def __getitem__(self, index):
        # 获得歌曲路径
        audio_sample_path = self._get_audio_sample_path(index)
        # 对路径处理下，不然格式不太正确
        path_address = audio_sample_path.replace("\\", '/')
        # 获得标签
        label = self._get_audio_sample_label(index)
        # signal 采样信号 sr 采样频率
        signal, sr = torchaudio.load(audio_sample_path)
        signal = signal.to(self.device)
        # 控制采样频率
        signal = self._resample_if_necessary(signal, sr)
        # 双通道->单通道
        signal = self._mix_down_if_necessary(signal)
        # 控制采样数量
        signal = self._cut_if_necessary(signal)
        signal = self._right_pad_if_necessary(signal)
        # 转化下mel频谱
        signal = self.transformation(signal)
        return signal, label, path_address

    # 是否需要对信号裁剪： 如果采数量 > 设定的数量 -> 裁剪
    def _cut_if_necessary(self, signal):
        # print('_cut_if_necessary')
        if signal.shape[1] > self.num_samples:
            signal = signal[:, :self.num_samples]
        return signal

    # 是否需要对信号补充： 向右填0补充，如果采数量 < 设定的数量 -> 补充
    def _right_pad_if_necessary(self, signal):
        length_signal = signal.shape[1]
        # print('_right_pad_if_necessary')
        if length_signal < self.num_samples:
            num_missing_samples = self.num_samples - length_signal
            last_dim_padding = (0, num_missing_samples)
            # last_dim_padding.to(self.device)
            signal = torch.nn.functional.pad(signal, last_dim_padding)
        return signal

    # 重新设定采样频率
    def _resample_if_necessary(self, signal, sr):
        # print('_resample_if_necessary')
        # 如果实际的采样频率没有和设定的一致，那么才重新设定
        if sr != self.target_sample_rate:
            resampler = torchaudio.transforms.Resample(sr, self.target_sample_rate).to(self.device)
            signal = resampler(signal)
            # signal = torchaudio.functional.resample(signal, sr, self.target_sample_rate)

        return signal

    # 将音频的双通道改为单通道
    def _mix_down_if_necessary(self, signal):
        # print('_mix_down_if_necessary')
        # 通道数大于1 就 取均值变成单通道
        if signal.shape[0] > 1:
            signal = torch.mean(signal, dim=0, keepdim=True)
        return signal

    # ok
    # 对音频路径进行拼接提取
    def _get_audio_sample_path(self, index):
        # print('_get_audio_sample_path')
        fold = f"{self.annotations.iloc[index, -2]}"
        path = os.path.join(self.audio_dir, fold, self.annotations.iloc[
            index, 1])
        return path

    # ok
    # 从csv文件中提取出标签
    def _get_audio_sample_label(self, index):
        # print('_get_audio_sample_label')
        return self.annotations.iloc[index, -1]

# 这边测试是失败的，原因是音频路径问题，但是在前面视图文件中调用这边函数是成功的，类内调用和类外调用路径还是不统一的
if __name__ == "__main__":
    ANNOTATIONS_FILE = "features_30_sec_final.csv"
    AUDIO_DIR = "F:\datasets\GTZAN\genres_original"
    SAMPLE_RATE = 22050
    NUM_SAMPLES = 22050 * 5  # -> 1 second of audio
    plot = True

    if torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"
    print(f"Using {device} device")

    mfcc = torchaudio.transforms.MFCC(
        sample_rate=SAMPLE_RATE,
        n_mfcc=40,
        log_mels=True
    )

    mel_spectrogram = torchaudio.transforms.MelSpectrogram(
        sample_rate=SAMPLE_RATE,
        n_fft=1024,
        hop_length=512,
        n_mels=64
    )

    # objects inside transforms module are callable!
    # ms = mel_spectrogram(signal)

    gtzan = GTZANDataset(
        ANNOTATIONS_FILE,
        AUDIO_DIR,
        mfcc,
        SAMPLE_RATE,
        NUM_SAMPLES,
        device
    )

    print(f"There are {len(gtzan)} samples in the dataset")

    if plot:
        signal, label, path = gtzan[666]
        print(f'path:{path}')
        signal = signal.cpu()
        print(signal.shape)

        plt.figure(figsize=(16, 8), facecolor="white")
        plt.imshow(signal[0, :, :], origin='lower')
        plt.autoscale(False)
        plt.xlabel("Time")
        plt.ylabel("Frequency")
        plt.colorbar()
        plt.axis('auto')
        plt.show()
