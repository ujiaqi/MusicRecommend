# 这个没啥用，同学挂载我服务器上的项目
# srecommend/music/static/svm 文件可删除


# import cv2
# import numpy as np
# import os
# BOW_NUM_TRAINING_SAMPLES_PER_CLASS = 10
# SVM_NUM_TRAINING_SAMPLES_PER_CLASS = 75
#
# SVM_SCORE_THRESHOLD = 1.8
# NMS_OVERLAP_THRESHOLD = 0.15
#
# sift = cv2.xfeatures2d.SIFT_create()
#
# FLANN_INDEX_KDTREE = 1
# index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
# search_params = {}
# flann = cv2.FlannBasedMatcher(index_params, search_params)
#
#
# bow_kmeans_trainer = cv2.BOWKMeansTrainer(20)
# bow_extractor = cv2.BOWImgDescriptorExtractor(sift, flann)
#
# def get_paths(i):
#
#     mouse_path = os.path.abspath('../static/svm/Train/mouse/mouse%d.jpg' % (i+1))
#     keyboard_path = os.path.abspath('../static/svm/Train/keyboard/keyboard%d.jpg' % (i + 1))
#     host_path = os.path.abspath('../static/svm/Train/host/host%d.jpg' % (i + 1))
#
#     return mouse_path, keyboard_path, host_path
#
# def add_sample(path):
#     img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
#     keypoints, descriptors = sift.detectAndCompute(img, None)
#     if descriptors is not None:
#         bow_kmeans_trainer.add(descriptors)
#
# for i in range(BOW_NUM_TRAINING_SAMPLES_PER_CLASS):
#     mouse_path, keyboard_path, host_path = get_paths(i)
#     add_sample(mouse_path)
#     add_sample(keyboard_path)
#     add_sample(host_path)
#
#
#
# voc = bow_kmeans_trainer.cluster()
# bow_extractor.setVocabulary(voc)
# def extract_bow_descriptors(img):
#     features = sift.detect(img)
#     return bow_extractor.compute(img, features)
#
#
# if __name__ == "__main__":
#     svm = cv2.ml.SVM_create()
#     path_abs = os.path.abspath("../static/svm/svmtest.xml")
#     print(path_abs)
#     svm = cv2.ml.SVM_load(path_abs)
#
#     iImage = 2
#     #
#     #  下面主要是显示测试集的识别效果与准确率，接口部分应该不需要这些，转换成
#
#     test_img_path = os.path.abspath('../static/svm/Train/keyboard/keyboard%d.jpg' % (iImage))
#     print(test_img_path)
#     img = cv2.imread(test_img_path)  # 此处是根据上方路径读取图片，安卓我应该直接发另一种数据，大概可以跳过
#     gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # 图片转为灰度图，我可以在安卓中一并完成
#     descriptors = extract_bow_descriptors(gray_img)  # 此处是调用安卓发来的灰度图来提取特征
#     prediction = svm.predict(descriptors)  # 根据模型识别最后输出为一个float类型的数据传回去给安卓就行
#     print(prediction[1][0][0])
