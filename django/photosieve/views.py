from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse
from django.views import View
import os
from apps import PhotoalbumConfig
from PIL import Image
import base64
import cStringIO
import json
import zipfile
import tempfile
from posix import tmpfile
from django.views.decorators.csrf import csrf_exempt 

def index(request):
    return HttpResponse("Not sure how you got here, but it's not right.")

class Rest_Archives(View):
    def get(self, request):
        archives = map(lambda x: {'name':x},sorted([x for x in os.listdir(PhotoalbumConfig.BASEPATH) \
                           if os.path.isdir(os.path.join(PhotoalbumConfig.BASEPATH,x))]))
        return JsonResponse({'return':archives,
                             'status':"Success"})
        
    
    def post(self, request):
        return JsonResponse({'status':"Not yet implemented"})

class Rest_Archive(View):
    def get(self, request, archive):
        image_names = sorted([x for x in os.listdir(os.path.join(PhotoalbumConfig.BASEPATH, archive))\
                              if (not os.path.isdir(x) and os.path.splitext(x)[1] in PhotoalbumConfig.IMG_EXTENSIONS)])
        return JsonResponse({'return':image_names,
                             'status':"Success"})
    
    def post(self, request, archive):
        return JsonResponse({'status':"Not yet implemented"})

class Rest_Filename(View):
    def get(self, request, archive, filename):
        with open(os.path.join(PhotoalbumConfig.BASEPATH,archive, filename),'rb') as fin:
            img = Image.open(fin)
            if request.GET.get("thumbnail",'') == "True":
                img = img.resize([PhotoalbumConfig.THMB_WIDTH, PhotoalbumConfig.THMB_HEIGHT])
            buffer = cStringIO.StringIO()
            img.save(buffer, format="JPEG")
            return JsonResponse({'return': {'archive': archive,
                                            'filename': filename,
                                            'data': base64.b64encode(buffer.getvalue())},
                                 'status':"Success"})
    
    def post(self, request, archive, filename):
        return JsonResponse({'status':"Not yet implemented"})

class Rest_Zip(View):
    current_zip = ""
    
    @csrf_exempt
    def post(self, request):
        requested_images = json.loads(request.body)
        Rest_Zip.current_zip = tempfile.TemporaryFile(mode='w+b',prefix="album", suffix=".zip")
        zfile = zipfile.ZipFile(Rest_Zip.current_zip,'w') 
        for file in requested_images:
            zfile.write(os.path.join(PhotoalbumConfig.BASEPATH,file['archive'],file['filename']),file['filename']) 
        zfile.close()
        Rest_Zip.current_zip.flush()
        Rest_Zip.current_zip.seek(0)
        return JsonResponse({'return': "rest/zip",
                             'status': "Success"})  
    
    def get(self, request): 
        response = HttpResponse(Rest_Zip.current_zip.read() , content_type='application/zip')
        response['Content-Disposition'] = "attachment;filename=album.zip"
        return response
        
        
        
        
                
    