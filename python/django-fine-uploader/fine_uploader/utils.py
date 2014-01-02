import os, os.path, shutil

def combine_chunks(total_parts, total_size, source_folder, dest):

    if not os.path.exists(os.path.dirname(dest)):
        os.makedirs(os.path.dirname(dest))

    with open(dest, 'wb+') as destination:
        for i in xrange(total_parts):
            part = os.path.join(source_folder, str(i))
            with open(part, 'rb') as source:
                destination.write(source.read())


def save_upload(f, path):
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    with open(path, 'wb+') as destination:
        if hasattr(f, 'multiple_chunks') and f.multiple_chunks():
            for chunk in f.chunks():
                destination.write(chunk)
        else:
            destination.write(f.read())


