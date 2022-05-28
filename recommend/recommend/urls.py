"""recommend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.urls import path
from music import views
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    # re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}, name='media'),
    path('admin/', admin.site.urls),
    path('index', views.index),
    path('josnIndex',views.josn_index),
    path('predicting', views.predicting),
    path('previous', views.previous),
    path('init', views.josn_index),
    path('project', views.project),
    path('getMusicList', views.get_music_list),
    path('getMusicRecommend', views.get_music_recommend),
    path('getRecommendGenre', views.get_recommend_genre),
    # path('upload',views.upload),
    # path('recognition',views.recognition)

]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)