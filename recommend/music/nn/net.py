import torch.nn as nn

# AlexNet网络
class AlexNet(nn.Module):
    def __init__(self, num_classes=10):
        super(AlexNet, self).__init__()
        self.features = nn.Sequential(
            # 卷积 输入通道1，输出通道64 卷积核大小11*11 步长4 零填充2
            nn.Conv2d(1, 64, kernel_size=11, stride=4, padding=2),
            # ReLU激活函数
            nn.ReLU(inplace=True),
            # 最大池化
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(64, 192, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
            nn.Conv2d(192, 384, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(384, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2),
        )
        # 展开
        self.flatten = nn.Flatten()
        # 分类器
        self.classifier = nn.Sequential(
            # 线性分类器 全连接层
            nn.Linear(12288, 1024),
            nn.ReLU(inplace=True),
            # Dropout 随机失活
            nn.Dropout(p=0.5, inplace=False),
            nn.Linear(1024, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3, inplace=False),
            nn.Linear(1024, num_classes),
        )
    # 前向传播
    def forward(self, x):
        x = self.features(x)
        #x = x.view(-1, 3072)
        x = self.flatten(x)
        x = self.classifier(x)
        return x