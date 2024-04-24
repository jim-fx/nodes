use utils::{
    geometry::{create_multiple_paths, create_path, wrap_multiple_paths},
    get_args,
};

#[allow(dead_code)]
#[rustfmt::skip]
fn test_split_args(){
    let inputs = vec![
        vec![0, 1, 0, 4, 1056964608, 1065353216, 1056964608, 1, 4, 1080872141, 1054951342, 32, 1, 1 ],
        vec![0, 4, 1056964608, 1065353216, 1056964608, 1, 4],
        vec![0, 1, 0, 3, 0, 0, 0, 5, 0, 0, 1073741824, 1073741824, 1, 1, 1, 1, 1, 4, 1065353216, 1054615798, 5, 1, 1 ],
        vec![ 0, 1, 0, 3, 0, 0, 0, 1, 4, 1073741824, 1073741824, 32, 1, 1 ],
        vec![0, 1, 0, 1, 0, 14, 0, 1056964608, 1056964608, 1056964608, 1058810102, 1056964608, 1069547520, 1056964608, 1050421494, 1056964608, 1075838976, 1056964608, 0, 1, 1, 1, 2, 13, 1, 1],
        vec![ 0, 1, 0, 2, 0, 0, 5, 0, 0, 1073741824, 1073741824, 1, 2, 0, 1, 4, 1088212173, 1083388723, 20, 1, 1 ]
    ];

    for input in inputs {
        println!("RESULT: {:?}", get_args(&input));
    }
}

fn test_path() {
    // let path_data = create_path(3, 2);
    // println!("{:?}", path_data);

    let mut multiple_paths = create_multiple_paths(1, 4, 1);
    let mut wrapped_paths = wrap_multiple_paths(&mut multiple_paths);
    wrapped_paths[0].points[0] = 1.0;
    println!("{:?}", wrapped_paths);
    println!("{:?}", multiple_paths);
}

fn main() {
    test_path()
}
