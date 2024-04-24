static PATH_HEADER_SIZE: usize = 2;
// 0: node-type, stem: 0
// 1: depth

#[derive(Debug)]
pub struct PathData<'a> {
    pub header: &'a mut [i32],
    pub length: usize,
    pub points: &'a mut [f32],
}

pub fn create_multiple_paths(amount: usize, point_amount: usize, depth: i32) -> Vec<i32> {
    let output_size = amount * (point_amount * 4 + PATH_HEADER_SIZE + 4) + 4;

    let mut path: Vec<i32> = vec![0; output_size];

    path[0] = 0; // encode opening bracket
    path[1] = 1; // encode opening bracket
    path[output_size - 2] = 1; // encode closing bracket
    path[output_size - 1] = 1; // encode closing bracket

    for i in 0..amount {
        let start_index = 2 + i * (point_amount * 4 + PATH_HEADER_SIZE + 4);
        let end_index = 2 + (i + 1) * (point_amount * 4 + PATH_HEADER_SIZE + 4);

        path[start_index] = 0; // encode opening bracket
        path[start_index + 1] = point_amount as i32 * 4 + 3; // encode opening bracket
        path[start_index + 2] = 0; // encode node-type, stem: 0
        path[start_index + 3] = depth; // encode depth

        path[end_index - 2] = 1; // encode closing bracket
        path[end_index - 1] = 1; // encode closing bracket
    }

    path
}

pub fn wrap_multiple_paths(mut input: &mut [i32]) -> Vec<PathData<'_>> {
    let mut paths = Vec::new();
    let mut end_index = 2;

    // remove starting bracket
    input = &mut input[2..];

    while end_index < input.len() - 1 {
        end_index = input[1] as usize + 3;
        if end_index < input.len() {
            let (path_slice, remaining) = input.split_at_mut(end_index);
            let path_data = wrap_path(path_slice);
            paths.push(path_data);
            input = remaining;
        } else {
            break;
        }
    }

    paths
}

pub fn create_path(point_amount: usize, depth: i32) -> Vec<i32> {
    let output_size = point_amount * 4 + PATH_HEADER_SIZE + 4;

    let mut path: Vec<i32> = vec![0; output_size];

    path[0] = 0; // encode opening bracket
    path[1] = (point_amount * 4) as i32 + 2; // encode opening bracket
    path[2] = 0; //encode node-type, stem: 0
    path[3] = depth; //encode depth
    path[output_size - 2] = 1; // encode closing bracket
    path[output_size - 1] = 1; // encode closing bracket

    path
}

pub fn wrap_path<'a>(geometry: &'a mut [i32]) -> PathData<'a> {
    // Basic validity checks
    assert!(
        geometry.len() > PATH_HEADER_SIZE,
        "Geometry vector does not contain enough data for a header."
    );

    let (_opening_brackets, rest) = geometry.split_at_mut(2);

    // Split at after header
    let (header, rest) = rest.split_at_mut(PATH_HEADER_SIZE);

    // split after points, excluding last two that encode closing bracket
    let (points_slice, _closing_bracket) = rest.split_at_mut(rest.len() - 2);

    assert!(
        points_slice.len() % 4 == 0,
        "Points slice does not match the expected size.",
    );

    let length = points_slice.len() / 4;

    let points: &'a mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(points_slice.as_mut_ptr() as *mut f32, points_slice.len())
    };

    PathData {
        header,
        length,
        points,
    }
}
