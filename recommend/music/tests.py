from django.test import TestCase

# Create your tests here.
if __name__ == "__main__":
    list_1 = [{"id":1, "name": "qa"},{"id":0, "name": "qas"},{"id":5, "name": "qaf"}]
    r = sorted(list_1, key=lambda x: x.get("id"))

    print(r[0:2])
    # print(net_music_list())