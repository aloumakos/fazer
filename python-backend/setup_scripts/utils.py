import os
import matplotlib.pyplot as plt
import cv2 as cv
import numpy as np
import torch
from ftplib import FTP
import sqlalchemy as sqlalc
from sqlalchemy import text, case
import struct
from sqlalchemy.orm import Session


def plot_images(imgs):
    if type(imgs) is not list:
        plt.figure(figsize=(12, 6))
        plt.imshow(imgs)
        plt.axis('off')
        return

    n = len(imgs)

    f, axes = plt.subplots(n // 5 + 1, 5, figsize=(16, 10), squeeze=False)

    for i in range(n - n % 5 + 5):
        try:
            axes[i // 5, i % 5].imshow(imgs[i])
            axes[i // 5, i % 5].axis('off')
        except:
            axes[i // 5, i % 5].axis('off')


def load_image(image, from_path=False):
    if not from_path:
        image = np.asarray(bytearray(image), dtype='uint8')
        image = cv.imdecode(image, cv.IMREAD_COLOR)
        image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
        return image

    image = cv.imread(image)
    image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
    return image


def read_files(path=None, ftp=None, engine=None, table=None, column='image'):
    if path is not None:
        return read_files_from_dir(path)

    if ftp is not None:

        server = FTP(os.environ.get('FTP_HOST'))
        server.login(user=os.environ.get('FTP_USER'), passwd=os.environ.get('FTP_PWD'))

        for folder in server.nlst():
            try:
                os.mkdir('temp/' + folder)
            except:
                pass
            for img in ftp.nlst(folder):
                try:
                    server.retrbinary("RETR " + img, open('temp/' + img, 'wb').write)
                except:
                    pass
        return read_files_from_dir('temp')

    if engine is not None:
        if table is None:
            raise Exception
        with Session(engine) as session:
            return session.execute(text(f"SELECT id, {column} FROM {table} ORDER BY id")).fetchall()


def read_files_from_dir(dir):
    files = []
    for root, _, filenames in os.walk(dir):
        for file in filenames:
            files.append(os.path.join(root, file))
    return files


def compute_sim_torch(embed1, embed2, metric='cos_sim', out='pt'):
    if metric == 'cos_sim':
        if out == 'pt':

            return torch.mm(embed1, torch.t(embed2))
        else:
            return np.dot(embed1, np.transpose(embed2))
    elif metric == "eucl_dist":
        diff = embed2-embed1.unsqueeze(1)
        return torch.norm(diff,p=2,dim=-1)


def commit_to_db(data, engine, table, from_path=False, model=None, ):
    payload = dict(data)
    data = list(payload.values())
    faces, good_idxs = model.crop_face([load_image(img) for img in data])
    embeddings = model.calc_embedding_from_crop(faces)

    embeddings = list(map(lambda x: struct.pack('%sf' % len(x), *x), embeddings))

    start_idx = list(payload.keys())[0]
    final_payload = [{} for _ in range(len(good_idxs))]
    for i, id in enumerate(good_idxs):
        final_payload[i]['id'] = start_idx + id
        final_payload[i]['embedding'] = embeddings[i]

    with Session(engine) as session:
        result = session.execute(
            text(f"UPDATE {table} SET embedding=:embedding WHERE id=:id"),
            final_payload)

        session.commit()


def load_embeddings(embeddings):
    embeddings = np.array(list(map(lambda x: np.array(struct.unpack('512f', x[0])), embeddings)))
    return embeddings
