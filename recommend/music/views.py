from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

from music.nn.prediction import get_music
from music.nn.prediction import get_predict_music, net_music_list, net_recommend_genre, net_predict_music

import random
import os
from django.conf import settings

# 这部分代码没用，当时给我同学挂的一个项目

# import cv2
# import numpy as np
#
# # init_url = None
# # init_label = None
# # init_index = None
#
#
# ################################################
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
#     mouse_path = os.path.abspath('./music/static/svm/Train/mouse/mouse%d.jpg' % (i+1))
#     keyboard_path = os.path.abspath('./music/static/svm/Train/keyboard/keyboard%d.jpg' % (i + 1))
#     host_path = os.path.abspath('./music/static/svm/Train/host/host%d.jpg' % (i + 1))
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
# ################################################

# index页面
def index(request):
    music_init_label, music_init_url, music_init_index = get_music()
    # global init_url
    # global init_label
    # global init_index
    image = f'./static/background/background_{random.randint(0, 7)}.jpg'
    init_index = music_init_index
    init_label = music_init_label
    init_url = music_init_url.replace("/music",'')
    print(f'index: {init_url}')
    content = [{"title": f'init: {init_label}',
                "artist": "Josh Yu",
                "mp3": init_url,
                "poster": image,
                "init_index":init_index},]

    return render(request, 'index.html', {"content": content})


# index.html相关：返回Json
def josn_index(request):
    music_init_label, music_init_url, music_init_index = get_music()
    image = f'./static/background/background_{random.randint(0, 7)}.jpg'
    init_index = music_init_index
    init_index = music_init_index
    init_label = music_init_label
    init_url = music_init_url.replace("/music", '')
    print(f'index: {init_url}')
    content = [{"title": f'init: {init_label}',
                "artist": "Josh Yu",
                "mp3": init_url,
                "poster": image,
                "init_index": int(init_index)}, ]

    return JsonResponse(content, safe=False)

# index.html相关，返回预测信息
def predicting(request):
    get_result = request.POST
    print(request.POST)
    image = f'./static/background/background_{random.randint(0, 7)}.jpg'
    max_music_url, music_init_index, real_label_index = get_predict_music(int(get_result["init_index"]))
    max_url = max_music_url.replace("/music",'')
    content = [{"title": f'{get_result["title"]}',
                "artist": f'predict: {real_label_index}',
                "mp3": max_url,
                "oga": "http://www.jplayer.org/audio/ogg/Miaow-07-Bubble.ogg",
                "poster": image,
                "init_index":get_result["init_index"]}]
    return JsonResponse(content, safe=False)

# index.html相关，返回初始加载的歌曲信息
def previous(request):
    get_result = request.POST
    content = [{"title": get_result["title"],
                "artist": "The Starting Point",
                "mp3": get_result["mp3"],
                "poster": "https://file.fishei.cn/wallhaven-g89p2.png",
                "init_index":get_result["init_index"]},
               ]
    return JsonResponse(content, safe=False)


# project.html相关，返回随机推荐5首同种风格的歌曲
def get_recommend_genre(request):
    music_list = net_recommend_genre()
    return JsonResponse({"musicList": music_list, "getId":5190711437}, safe=False)

# 返回project.html页面
def project(request):
    return render(request, 'project.html')

# project.html相关，随机推荐5首歌曲
def get_music_list(request):
    music_list = net_music_list()
    return JsonResponse({"musicList": music_list, "getId":5177783391}, safe=False)

# project.html相关，对喜欢的歌曲进行推荐
def get_music_recommend(request):
    get_result = request.GET["musicIndex"]
    if len(get_result) == 0:
        get_result = random.sample(range(0, 10), 1)[0]
    print(get_result)
    music_list = net_predict_music(int(get_result))
    return JsonResponse({"musicList": music_list, "getId":5190711435}, safe=False)

# 这部分代码没用，当时给我同学挂的一个项目
#
# def upload(request):
#     if request.method == "GET":
#         return render(request, 'upload.html')
#     print(request.POST)
#     print(request.FILES)
#     file_object = request.FILES.get('picture')
#     file_path = os.path.join(settings.MEDIA_ROOT,file_object.name)
#     print(file_object.name)
#     f = open(file_path, mode='wb')
#     for chunk in file_object.chunks():
#         f.write(chunk)
#     f.close()
#     return HttpResponse("ok")
#
#
# def recognition(request):
#     svm = cv2.ml.SVM_create()
#     path_abs = os.path.abspath("./music/static/svm/svmtest.xml")
#     #print(path_abs)
#     svm = cv2.ml.SVM_load(path_abs)
#     result = None
#     ##################################
#     if request.method == "GET":
#         return render(request, 'upload.html')
#     #print(request.POST)
#     #print(request.FILES)
#     file_object = request.FILES.get('picture')
#     file_path = os.path.join(settings.MEDIA_ROOT,file_object.name)
#     print(file_object.name)
#     f = open(file_path, mode='wb')
#     for chunk in file_object.chunks():
#         f.write(chunk)
#     f.close()
#     #################################
#     # iImage = 2
#     #
#     #  下面主要是显示测试集的识别效果与准确率，接口部分应该不需要这些，转换成
#
#     test_img_path = os.path.abspath(file_path)
#     #print(test_img_path)
#     img = cv2.imread(test_img_path)  # 此处是根据上方路径读取图片，安卓我应该直接发另一种数据，大概可以跳过
#     gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # 图片转为灰度图，我可以在安卓中一并完成
#     descriptors = extract_bow_descriptors(gray_img)  # 此处是调用安卓发来的灰度图来提取特征
#     prediction = svm.predict(descriptors)  # 根据模型识别最后输出为一个float类型的数据传回去给安卓就行
#     if prediction[1][0][0] == 1.0:
#         result = 'mouse'
#     elif prediction[1][0][0] == 2.0:
#         result = 'keyboard'
#     else:
#         result = 'host'
#     return JsonResponse({"code":"200", "Results": result}, safe=False)
