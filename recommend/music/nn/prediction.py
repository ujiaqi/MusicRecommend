import random
import torch
import torchaudio
import os
from music.nn.net import AlexNet
from music.nn.GTZANDataset import GTZANDataset

# 设置 标签文件路径
PATH_ANNOTATIONS_FILE = os.path.abspath("./music/nn/features_30_sec_final.csv")
# 设置音频文件路径
PATH_AUDIO_DIR = "./music/static/GTZAN/genres_original"
ANNOTATIONS_FILE = PATH_ANNOTATIONS_FILE
AUDIO_DIR = PATH_AUDIO_DIR
# 采样频率
SAMPLE_RATE = 22050
# 采样数量 5s
NUM_SAMPLES = 22050 * 5
# 初始化模型
cnn = AlexNet()
# 导入模型
path_abs = os.path.abspath("./music/nn/best_model_okk.pth")
state_dict = torch.load(path_abs,map_location='cpu')
cnn.load_state_dict(state_dict)

# 这个没用
mfcc = torchaudio.transforms.MFCC(
        sample_rate=SAMPLE_RATE,
        n_mfcc=128,
        log_mels=True
)

# 转化梅尔频谱
mel_spectrogram = torchaudio.transforms.MelSpectrogram(
    sample_rate=SAMPLE_RATE,
    n_fft=1024,
    hop_length=512,
    n_mels=64
)

# 数据处理
gtzan = GTZANDataset(annotations_file=ANNOTATIONS_FILE, audio_dir=AUDIO_DIR,
                     transformation=mfcc, target_sample_rate=SAMPLE_RATE,
                     num_samples=NUM_SAMPLES, device="cpu")
# 标签列表
class_mapping = [
    'blues',
    'classical',
    'country',
    'disco',
    'hiphop',
    'jazz',
    'metal',
    'pop',
    'reggae',
    'rock'
]

cnn.eval()

# 这个是对应index页面的，也就是初版
def get_music():
    global class_mapping
    # 随机获得一个音乐下标
    initial = random.sample(range(0, 1000), 1)[0]
    print(f'initial:{initial}')
    # 获得音乐标签下标
    music_init_index = gtzan[initial][1]
    # 获得音乐的地址
    music_init_url = gtzan[initial][2]
    print(f'music_init:{music_init_url}')
    return class_mapping[music_init_index], music_init_url, music_init_index

# project.html 终版：初步封装音乐数据
def get_music_list(initial):
    music_list = []
    for i in range(5):
        with torch.no_grad():
            # 字典 对参数进行封账
            per = {}
            # 获得风格名
            name = class_mapping[gtzan[initial[i]][1]]
            # 获得音乐地址
            init_url = gtzan[initial[i]][2]
            mp3 = init_url.replace("/music", '')
            # 音乐风格名
            per["name"] = name
            # 音乐名
            per["artist"] = init_url.rsplit("/", 1)[1]
            # 音乐地址
            per["mp3Url"] = mp3
            # 音乐id，主要是使用前端模板
            per["id"] = i
            # 音乐风格下标
            per["style"] = int(gtzan[initial[i]][1])
            # 随机获得背景图片
            per["picUrl"] = f'./static/background/background_{random.randint(0, 7)}.jpg'
            music_list.append(per)
    return music_list


# project.html 随机获得5首歌曲信息
def net_music_list():
    global class_mapping
    initial = random.sample(range(0, 1000),5)
    return get_music_list(initial)

# project.html 随机获得同种类型的5首歌曲的信息
def net_recommend_genre():
    global class_mapping
    # 随机0~9数字，类别
    index = random.sample(range(0, 10), 1)[0]
    # 在0~999中随机取一个数字，音乐下标
    initial = random.sample(range(index * 100, index * 100 + 99), 5)
    return get_music_list(initial)


# 对喜欢的歌曲进行推荐
def net_predict_music(music_index):
    global class_mapping
    # 随机获得20个下标
    ran = random.sample(range(0, 1000), 20)
    music_list = []
    # 对这20首歌曲放入神经网络模型中
    # 神经网络输出值进行排序，选取值最大的5首
    # 这边建议去改造以下AlexNet，再添加一个SoftMax比较合适
    for i in range(20):
        # 以下省略部分代码
        with torch.no_grad():
            per = {}
            predictions = cnn(gtzan[ran[i]][0].unsqueeze_(0))
            predicted_item = predictions[0][music_index].item()
            name = class_mapping[gtzan[ran[i]][1]]
            per["value"] = predicted_item
            url = gtzan[ran[i]][2]
            mp3 = url.replace("/music", '')
            per["name"] = name
            per["artist"] = url.rsplit("/", 1)[1]
            per["mp3Url"] = mp3
            per["id"] = i
            per["style"] = int(gtzan[ran[i]][1])
            per["picUrl"] = f'./static/background/background_{random.randint(0, 7)}.jpg'
            music_list.append(per)
    # 对输出值进行排序
    sort_music = sorted(music_list, key=lambda x: x.get("value"), reverse=True)
    # 选择值最大的5首返回
    return sort_music[0:5]

# 这个为index.html页面的 原理差不多，就是对歌曲推荐
def get_predict_music(music_init_index):
    # global music_init_index
    global class_mapping
    max_music_value = - float("inf")
    max_music_index = None
    max_music_url = None
    real_label_index = None
    # 随机选取15首
    ran = random.sample(range(0, 1000), 15)
    content = {}
    for i in range(15):
        with torch.no_grad():
            predictions = cnn(gtzan[ran[i]][0].unsqueeze_(0))
            predicted_item = predictions[0][music_init_index].item()
            # 记录输出值最大的一首歌的信息
            if max_music_value < predicted_item:
                max_music_value = predicted_item
                max_music_index = i
                real_label_index = gtzan[ran[i]][1]
                max_music_url = gtzan[ran[i]][2]
            content[gtzan[ran[i]][2]] = predicted_item
    return max_music_url, class_mapping[music_init_index], class_mapping[real_label_index]



if __name__ == "__main__":
    list_1 = [{"id":1},{"id":0},{"id":5}]
    r = sorted(list_1, key=lambda x: x.get("id"))
    print(r)
    # print(net_music_list())
