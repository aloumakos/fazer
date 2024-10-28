from ts.torch_handler.base_handler import BaseHandler
import zipfile

import os
from io import BytesIO
from PIL import Image
import numpy as np
import torch
from torchvision import transforms
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
            with zipfile.ZipFile(os.path.join(model_dir, "retina.zip"), "r") as zip_ref:
                zip_ref.extractall(model_dir)
        except:
            pass

        import importlib.util
        import sys

        spec = importlib.util.spec_from_file_location(
            "detector", os.path.join(model_dir, "face_detection", "detector.py")
        )
        foo = importlib.util.module_from_spec(spec)
        sys.modules["detector"] = foo

        spec.loader.exec_module(foo)

        retina = getattr(foo, "RetinaFace")
        self.model = retina(
            gpu_id=0,
            model_path=os.path.join(model_dir, "retina.pth"),
            network="resnet50",
        )
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

        def _preprocess(bin):
            bin = BytesIO(bin)
            image = Image.open(bin)

            try:
                if image.mode != "RGB":
                    image = image.convert("RGB")
            except Exception as e:
                raise e
            if self.batch > 1:
                image = image.resize((self.resize, self.resize))

            image = self.PILToTensor(image)
            return image

        preprocessed_data = []

        for msg in data:
            bin = msg["body"]
            image = _preprocess(bin)
            preprocessed_data.append(image)

        preprocessed_data = torch.stack(preprocessed_data)
        preprocessed_data = torch.permute(preprocessed_data, (0, 2, 3, 1))
        return preprocessed_data

    def inference(self, model_input):
        """
        Internal inference methods
        :param model_input: transformed model input data
        :return: list of inference output in NDArray
        """
        # Do some inference call to engine here and return output

        model_output = self.model(model_input)
        return model_output

    def postprocess(self, model_output):
        """
        Return inference result.
        :param inference_output: list of inference output
        :return: list of predict results
        """

        if self.batch == 1:
            return [[face[0].tolist() for face in model_output[0] if face[2] > 0.99]]

        def _postprocess(faces):
            after = []

            res = self.resize
            for face in faces:
                if face and face[2] > 0.99:
                    if face[0][0] < 0:
                        faces[0][0] = 0

                    if face[0][1] < 0:
                        face[0][1] = 0

                    if face[0][2] > res:
                        face[0][2] = res

                    if face[0][3] > res:
                        face[0][3] = res

                    after.append(
                        [
                            face[0][0] / res,
                            face[0][1] / res,
                            face[0][2] / res,
                            face[0][3] / res,
                        ]
                    )

            return after

        return list(map(_postprocess, model_output))

    def handle(self, data, context):
        """
        Invoke by TorchServe for prediction request.
        Do pre-processing of data, prediction using model and postprocessing of prediciton output
        :param data: Input data for prediction
        :param context: Initial context contains model server system properties.
        :return: prediction output
        """

        start1 = time.time()
        self.batch = len(data)
        images = self.preprocess(data)
        end = time.time()
        print(f"Preprocess for detection: {end-start1}")
        model_output = self.inference(images)
        start = time.time()
        print(f"Inference for detection: {start-end}")
        result = self.postprocess(model_output)
        end = time.time()
        print(f"Postprocess for detection: {end-start}")
        print(self.batch)
        print(f"Total time for detection: {end-start1}")
        return result
