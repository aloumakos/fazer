from ts.torch_handler.base_handler import BaseHandler
import zipfile

import os
from io import BytesIO
from PIL import Image
import numpy as np
import torch
from torchvision import transforms
import json
import redis
import time


class ModelHandler(BaseHandler):
    """
    A custom model handler implementation.
    """

    def __init__(self):
        self._context = None
        self.initialized = False
        self.explain = False
        self.target = 0

    def initialize(self, context):
        """
        Initialize model. This will be called during model loading time
        :param context: Initial context contains model server system properties.
        :return:
        """

        self._context = context
        self.initialized = True
        properties = context.system_properties
        model_dir = properties.get("model_dir")
        try:
            with zipfile.ZipFile(
                os.path.join(model_dir, "arcface.zip"), "r"
            ) as zip_ref:
                zip_ref.extractall(model_dir)
        except:
            pass

        import importlib.util
        import sys

        spec = importlib.util.spec_from_file_location(
            "__init__", os.path.join(model_dir, "backbones", "__init__.py")
        )
        foo = importlib.util.module_from_spec(spec)
        sys.modules["arc"] = foo

        spec.loader.exec_module(foo)

        get_model = getattr(foo, "get_model")

        self.model = get_model("r50", fp16=True)
        self.model.load_state_dict(torch.load("arc50.pth", map_location="cpu"))
        self.model.to("cuda")
        self.model.eval()

        self.redis = redis.Redis(host="localhost", port=6379, decode_responses=True)
        self.db_embeddings = torch.tensor(
            json.loads(self.redis.get("embeddings"))
        ).cuda()

        self.batch = 1
        self.resize = 500
        self.PILToTensor = transforms.Compose([transforms.PILToTensor()])

    def preprocess(self, data):
        """
        Transform raw input into model input data.
        :param batch: list of raw requests, should match batch size
        :return: list of preprocessed model input data
        """

        # Take the input data and make it inference ready
        # preprocessed_data = data[0].get("data")
        # if preprocessed_data is None:
        #     preprocessed_data = data[0].get("body")

        self.batch = len(data)

        # if self.batch == 1:
        #     bin = data[0]['preprocess']
        #     bin = BytesIO(bin)
        #     image = Image.open(bin)
        #     image = np.array(image)
        #     height, width, _ = image.shape

        #     coords = data[0]['m1']
        #     faces = json.loads(coords)
        #     if not faces:
        #         return None, None, None
        #     coords = [[face[0] / width, face[1] / height, face[2] / width, face[3] / height] for face in faces]
        #     faces = [image[round(faces[i][1]):round(faces[i][3]), round(faces[i][0]):round(faces[i][2])] for i in
        #      range(len(faces))]

        #     faces = [transform(torch.permute(torch.from_numpy(faces[i]),(2,0,1))) for i in range(len(faces))]

        #     faces = torch.stack(faces).float().to('cuda')
        #     faces.div_(255).sub_(0.5).div_(0.5)

        #     return faces, coords , None

        def _preproc(x):
            x = Image.fromarray(x)
            x = x.resize((112, 112))
            x = self.PILToTensor(x)
            return x

        start = time.time()
        boxes = [[] for _ in range(len(data))]
        preprocessed_data = []
        idx = [0 for _ in range(len(data) + 1)]
        for i in range(len(data)):
            bin = data[i]["preprocess"]
            bin = BytesIO(bin)
            image = Image.open(bin)

            try:
                if image.mode != "RGB":
                    image = image.convert("RGB")
            except Exception as e:
                raise e

            image = np.array(image)
            height, width, _ = image.shape

            coords = data[i]["m1"]
            coords = json.loads(coords)

            if self.batch == 1:
                faces = [
                    image[
                        round(coords[i][1]) : round(coords[i][3]),
                        round(coords[i][0]) : round(coords[i][2]),
                    ]
                    for i in range(len(coords))
                ]
                boxes[0] = [
                    [
                        face[0] / width,
                        face[1] / height,
                        face[2] / width,
                        face[3] / height,
                    ]
                    for face in coords
                ]
            else:
                boxes[i] = [[] for _ in range(len(coords))]
                faces = [[] for _ in range(len(coords))]
                idx[i + 1] = idx[i] + len(coords)

                for j, coord in enumerate(coords):
                    boxes[i][j] = coord

                    faces[j] = image[
                        round(coord[1] * height) : round(coord[3] * height),
                        round(coord[0] * width) : round(coord[2] * width),
                    ]

            if faces:
                faces = list(map(_preproc, faces))
                preprocessed_data.append(torch.stack(faces))

        if not faces:
            return None, None, None
        end = time.time()
        print(end - start)
        print([i.size() for i in preprocessed_data])
        preprocessed_data = torch.cat(preprocessed_data).float().to("cuda")
        preprocessed_data.div_(255).sub_(0.5).div_(0.5)
        print(time.time() - end)
        return preprocessed_data, boxes, idx

    def inference(self, model_input):
        """
        Internal inference methods
        :param model_input: transformed model input data
        :return: list of inference output in NDArray
        """
        # Do some inference call to engine here and return output
        with torch.no_grad():
            embeddings = self.model(model_input)

            scales = torch.norm(embeddings, dim=1).unsqueeze(1)
            embeddings = embeddings / scales

        return embeddings

    def postprocess(self, faces):
        """
        Return inference result.
        :param inference_output: list of inference output
        :return: list of predict results
        """
        # Take output from network and post-process to desired format

        start = time.time()
        top = torch.mm(faces, torch.t(self.db_embeddings))
        print(f"Multiplication of matrices {time.time()-start}")
        top = torch.topk(top, 10).indices

        return top.tolist()

    def handle(self, data, context):
        """
        Invoke by TorchServe for prediction request.
        Do pre-processing of data, prediction using model and postprocessing of prediciton output
        :param data: Input data for prediction
        :param context: Initial context contains model server system properties.
        :return: prediction output
        """
        start1 = time.time()
        images, boxes, idx = self.preprocess(data)
        end = time.time()
        print(f"Preprocessing of comparison {end-start1}")
        if images is None:
            return [{"faces": [], "results": []} for _ in range(self.batch)]

        embeddings = self.inference(images)
        start = time.time()
        print(f"Inference of comparison {start-end}")
        top = self.postprocess(embeddings)
        end = time.time()
        print(f"Postprocessing of comparison {end-start}")
        print(f"Total time of comparison {end-start1}")
        if self.batch == 1:
            return [{"faces": boxes, "results": top}]

        return [
            {"faces": boxes[i], "results": top[idx[i] : idx[i + 1]]}
            for i in range(len(boxes))
        ]
