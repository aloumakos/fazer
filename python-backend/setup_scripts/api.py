from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from utils import load_image
from arc.backbones import get_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
from face_detection import RetinaFace
from cv2 import resize


class Model:

    def __init__(self, model='arcnet', device="cpu", post_process=True):
        self.model = model
        self.device = device
        if model == 'arcnet':
            if device == 'cpu':
                gpu_id = -1
            else:
                gpu_id = 0
            self.retina = RetinaFace(model_path='Resnet50_Final.pth', network='resnet50', gpu_id=gpu_id)
            self.arc =  get_model('r50', fp16=False)
            self.arc.load_state_dict(torch.load('backbone_50.pth', map_location='cpu'))
            self.arc.to(device)
            self.arc.eval()
            
        else:
            self.mtcnn = MTCNN(selection_method= 'probability', device=device, post_process=post_process)
            self.resnet = InceptionResnetV1(pretrained='vggface2', device=device).eval()
            
    @torch.no_grad()
    def crop_face(self, images, orig_size=500):

        if not isinstance(images,list):
            faces = self.retina(images)
            return [face[0] for face in faces if face[2]>0.9]
    
        else:
            imgs = [resize(img,(orig_size,orig_size)) for img in images]
            
            b_size = len(imgs)
            
            if self.model == 'arcnet':
                faces = self.retina(imgs)

                good_idxs = [0 for _ in range(b_size)]
                crops = [0 for _ in range(b_size)]
                t = 0
                
                for i in range(b_size):
                    h, w, _ = images[i].shape
                    if faces[i][0][2]>0.95:
                        good_idxs[t]=i
                        
                        if faces[i][0][0][0]<0:
                            faces[i][0][0][0]=0

                        if faces[i][0][0][1]<0:
                            faces[i][0][0][1]=0

                        if faces[i][0][0][2]>orig_size:
                            faces[i][0][0][2]=orig_size

                        if faces[i][0][0][3]>orig_size:
                            faces[i][0][0][3]=orig_size
                        
                        faces[i][0][0][0], faces[i][0][0][2] = faces[i][0][0][0]/orig_size*w, faces[i][0][0][2]/orig_size*w
                        faces[i][0][0][1], faces[i][0][0][3] = faces[i][0][0][1]/orig_size*h, faces[i][0][0][3]/orig_size*h
                        crops[t] = images[i][round(faces[i][0][0][1]):round(faces[i][0][0][3]),round(faces[i][0][0][0]):round(faces[i][0][0][2])]
                        
                        t+=1
                good_idxs = good_idxs[:t]
                crops = crops[:t]
                return crops, good_idxs
            else:
                faces = self.mtcnn(torch.stack(imgs).permute(0,2,3,1))

                good_idxs = [0 for _ in range(b_size)]
                t = 0
                for i in range(b_size):
                    if faces[i][0][2]>0.9:
                        good_idxs[t]=i
                        t+=1
                good_idxs = good_idxs[:t]

                return [faces[i] for i in good_idxs], good_idxs

    @torch.no_grad()
    def calc_embedding_from_crop(self, faces, out= 'ls'):
        
        faces = [torch.from_numpy(resize(faces[i],(112,112))) for i in range(len(faces))]

        faces = torch.stack(faces).to(self.device)
        
        if self.model == 'arcnet':
            faces = torch.permute(faces,(0,3,1,2)).float()
            
            faces.div_(255).sub_(0.5).div_(0.5)
            embeddings = self.arc(faces)

            scales = torch.norm(embeddings,dim=1).unsqueeze(1)
            embeddings = embeddings/scales

        else:
            embeddings = self.resnet(faces)
        
        if out == 'ls':
            return embeddings.detach().tolist()
        elif out == 'np':
            return embeddings.detach().numpy()
        elif out == 'ts':
            return embeddings.detach()

    def calc_embedding_from_img(self, img, from_path=True):

        img = load_image(img, from_path= from_path)

        face = self.mtcnn(img)
        vector = self.resnet(face.unsqueeze(0).to(self.device)).squeeze()
            
        return vector.cpu().detach().squeeze().tolist()