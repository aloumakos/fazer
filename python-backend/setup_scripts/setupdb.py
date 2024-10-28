'''Script to setup database'''

import argparse
import struct
import json
import redis
import sqlalchemy as db
from tqdm import tqdm
from utils import read_files, commit_to_db
from api import Model


def setup(opts):
    '''Setup function'''
    engine = db.create_engine(opts.conn_str)

    if not opts.redis:
        model = Model(device=opts.device)

        result = read_files(engine=engine, table=opts.table_name, column = 'image')

        print(f'Read {len(result)} files')
        pbar = tqdm(range(len(result)//opts.batch_size))
        for i in pbar:
            pbar.set_description(f'Processed {i*opts.batch_size} images')
            images = result[i*opts.batch_size:(i+1)*opts.batch_size]
            commit_to_db(images, engine, opts.table_name, from_path=False, model=model, )

    db_embeddings = dict(read_files(engine=engine, table=opts.table_name, column = 'embedding'))
    db_embeddings = list(map(lambda x: list(struct.unpack('512f', x)), db_embeddings.values()))

    print('Storing embeddings in Redis')
    embeds = json.dumps(db_embeddings)
    rds = redis.Redis(host='localhost', port=6379, decode_responses=True)
    rds.set('embeddings', embeds)

    engine.dispose()


if __name__ == '__main__':

    parser = argparse.ArgumentParser(prog='Setup DB')

    parser.add_argument('--conn-str', required=True)
    parser.add_argument('--table-name', required=True)
    parser.add_argument('--device', default='cpu')
    parser.add_argument('--batch-size', default= 70)
    parser.add_argument('--redis', action='store_true')

    args = parser.parse_args()

    setup(args)
