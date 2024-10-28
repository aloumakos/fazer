use std::fs::{OpenOptions};
use memmap::{MmapMut};
use actix_web::{HttpResponse, HttpResponseBuilder};

fn test() {
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open("/dev/shm/my_shared_memory")
        .unwrap();

    // Set the size of the file to 1024 bytes
    file.set_len(13).unwrap();

    // Memory-map the file as writable
    let mut mmap = unsafe {
        MmapMut::map_mut(&file).unwrap()
    };

    // Write "Hello, world!" to the first 13 bytes of the memory-mapped file
    let message = "Hello, world!".as_bytes();
    mmap[..message.len()].copy_from_slice(message);

    // Make the memory-mapped file read-only
    let mmap = mmap.make_read_only().unwrap();

    // unmap the memory-mapped file
    drop(mmap);
}


pub fn test_mmap() -> HttpResponseBuilder {
    test();
    return HttpResponse::Ok();
}

// PYTHON//
// @app.route("/mmap_test", methods=['POST'])
// def mmap_test():
// import mmap
//
// # Open the memory-mapped file in read-only mode
// with open('/dev/shm/my_shared_memory', 'r+b') as f:
// mm = mmap.mmap(f.fileno(), 13)
// contents = mm.read().decode('utf-8')
// mm.close()
//
// return contents
