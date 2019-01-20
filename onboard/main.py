import time
import timeit
import image_slicer
import requests
import random
import math

# Given the prefix of the filename, upload the images to the other server
def uploadImages(pre, lat, long):
    try:
        for x in range(1, 4):
            for y in range(1, 4 ):
                time.sleep(0.5)
                with open('./data/' + pre + '_0' + str(x) + '_0' + str(y) + '.png', 'rb') as f:
                    multipart_form_data = {
                        'img.jpg': ('img.jpg', f),
                        'lat': (None, str(lat)),
                        'long': (None, str(long))
                    }
                    r = requests.post('http://a4c94c54.ngrok.io/upload', files=multipart_form_data)
                    print(r.text)
    except Exception as e:
        print(str(curTime) + " - UPLOAD FAILURE - " + str(e))

# Get reference time
start = timeit.default_timer()
timeToReset = 75

startLat = 42.848620
endLat = 42.848683
startLng = -106.326584
endLng = -106.297965

while True:
    # 42.848658, -106.326453
    # 42.848758, -106.298060
    curTime = timeit.default_timer()
    currLat = startLat + ((curTime - start)/(timeToReset * 1000)) * (endLat - startLat)
    currLng = startLng + ((curTime - start)/(timeToReset * 1000)) * (endLng - startLng)
    
    if curTime >= start + 12 and curTime <= start + 14:
        print(str(curTime) + " - sending image for processing FR1")
        image_slicer.slice('./data/12.jpg', 9)
        uploadImages("12", currLat , currLng)
    if curTime >= start + 27 and curTime <= start + 29:
        print(str(curTime) + " - sending image for processing FR2")
        image_slicer.slice('./data/27.jpg', 9)
        uploadImages("27", currLat , currLng)
    if curTime >= start + 47 and curTime <= start + 49:
        print(str(curTime) + " - sending image for processing FR3")
        image_slicer.slice('./data/45.jpg', 9)
        uploadImages("45", currLat , currLng)
    if curTime >= start + 59 and curTime <= start + 61:
        print(str(curTime) + " - sending image for processing FR4")
        image_slicer.slice('./data/49.jpg', 9)
        uploadImages("49", currLat , currLng)


    # Resets the clock once the video is done
    if curTime >= start + timeToReset:
        print(str(curTime) + " - RESETTING")
        start = timeit.default_timer()

    print(str(curTime) + " -DRONE AT " + str(currLat) + ", " + str(currLng))
    time.sleep(2)

