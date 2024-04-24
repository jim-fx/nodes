// 0: node-type, stem: 0
// 1: depth
static PATH_HEADER_SIZE: usize = 2;

#[derive(Debug)]
pub struct PathDataMut<'a> {
    pub length: usize,
    pub depth: i32,
    pub points: &'a mut [f32],
}

pub struct PathData<'a> {
    pub depth: i32,
    pub length: usize,
    pub points: &'a [f32],
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

pub fn wrap_multiple_paths(mut input: &mut [i32]) -> Vec<PathDataMut<'_>> {
    let mut paths = Vec::new();
    let mut end_index = 2;

    // remove starting bracket
    input = &mut input[2..];

    while end_index < input.len() - 1 {
        end_index = input[1] as usize + 3;
        if end_index < input.len() {
            let (path_slice, remaining) = input.split_at_mut(end_index);
            let path_data = wrap_path_mut(path_slice);
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
    path[1] = ((point_amount * 4) + PATH_HEADER_SIZE + 1) as i32; // encode opening bracket
    path[2] = 0; //encode node-type, stem: 0
    path[3] = depth; //encode depth
    path[output_size - 2] = 1; // encode closing bracket
    path[output_size - 1] = 1; // encode closing bracket

    path
}

pub fn wrap_path(input: &[i32]) -> PathData {
    // Basic validity checks
    assert!(
        input.len() > PATH_HEADER_SIZE,
        "Geometry vector does not contain enough data for a header."
    );

    let rest = &input[2..];

    let header = &rest[..PATH_HEADER_SIZE];

    let points_slice = &rest[PATH_HEADER_SIZE..rest.len() - 2];

    assert!(
        points_slice.len() % 4 == 0,
        "Points slice does not match the expected size. {}",
        points_slice.len()
    );

    let length = points_slice.len() / 4;

    let points: &[f32] = unsafe {
        std::slice::from_raw_parts(points_slice.as_ptr() as *const f32, points_slice.len())
    };

    PathData {
        depth: header[1],
        length,
        points,
    }
}

pub fn wrap_path_mut<'a>(geometry: &'a mut [i32]) -> PathDataMut<'a> {
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
        "Points slice does not match the expected size. {}",
        points_slice.len()
    );

    let length = points_slice.len() / 4;

    let points: &'a mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(points_slice.as_mut_ptr() as *mut f32, points_slice.len())
    };

    PathDataMut {
        depth: header[1],
        length,
        points,
    }
}

pub fn get_point_at_path(path: &[f32], alpha: f32) -> [f32; 4] {
    let a = alpha.min(0.999999).max(0.000001);

    let num_points = path.len() / 4;
    let segment_length = 1.0 / (num_points - 1) as f32;
    let mut target_index = (a / segment_length).floor() as usize;
    target_index = target_index.min(num_points - 2); // Ensure it doesn't exceed bounds

    let start_index = target_index * 4;
    let end_index = (target_index + 1) * 4;

    let t = (a - target_index as f32 * segment_length) / segment_length;

    let x1 = path[start_index];
    let y1 = path[start_index + 1];
    let z1 = path[start_index + 2];
    let w1 = path[start_index + 3];

    let x2 = path[end_index];
    let y2 = path[end_index + 1];
    let z2 = path[end_index + 2];
    let w2 = path[end_index + 3];

    // Linear interpolation
    let x = x1 + t * (x2 - x1);
    let y = y1 + t * (y2 - y1);
    let z = z1 + t * (z2 - z1);
    let w = w1 + t * (w2 - w1);

    [x, y, z, w]
}

pub fn get_direction_at_path(path: &[f32], alpha: f32) -> [f32; 3] {
    let num_points = path.len() / 4;

    let a = alpha.min(0.999999).max(0.000001);

    let segment_length = 1.0 / (num_points - 1) as f32;
    let target_index = (a / segment_length).floor() as usize;

    let start_index = target_index * 4;
    let end_index = (target_index + 1) * 4;

    let x1 = path[start_index];
    let y1 = path[start_index + 1];
    let z1 = path[start_index + 2];
    let x2 = path[end_index];
    let y2 = path[end_index + 1];
    let z2 = path[end_index + 2];

    // Direction vector (not normalized)
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dz = z2 - z1;

    let norm = (dx * dx + dy * dy + dz * dz).sqrt();

    if norm == 0.0 {
        return [0.0, 1.0, 0.0];
    }

    [dx / norm, dy / norm, dz / norm]
}
