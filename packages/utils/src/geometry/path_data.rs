use glam::{vec3, vec4, Vec3, Vec4, Vec4Swizzles};

// 0: node-type, stem: 0
// 1: depth
static PATH_HEADER_SIZE: usize = 2;

#[derive(Debug)]
pub struct PathDataMut<'a> {
    pub length: usize,
    pub depth: i32,
    pub points: &'a mut [f32],
}

impl PathDataMut<'_> {
    pub fn get_length(&self) -> f32 {
        let mut l = 0.0;
        for i in 0..(self.length - 1) {
            let a = vec3(
                self.points[i * 4],
                self.points[i * 4 + 1],
                self.points[i * 4 + 2],
            );
            let b = vec3(
                self.points[(i + 1) * 4],
                self.points[(i + 1) * 4 + 1],
                self.points[(i + 1) * 4 + 2],
            );
            l += (b - a).length();
        }
        l
    }
}

pub struct PathData<'a> {
    pub depth: i32,
    pub length: usize,
    pub points: &'a [f32],
}

impl PathData<'_> {
    pub fn get_length(&self) -> f32 {
        let mut l = 0.0;
        for i in 0..(self.length - 1) {
            let a = vec3(
                self.points[i * 4],
                self.points[i * 4 + 1],
                self.points[i * 4 + 2],
            );
            let b = vec3(
                self.points[(i + 1) * 4],
                self.points[(i + 1) * 4 + 1],
                self.points[(i + 1) * 4 + 2],
            );
            l += (b - a).length();
        }
        l
    }
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

/// A function that interpolates a position along a path given by `points_data` at a position
/// specified by `alpha` (ranging from 0.0 to 1.0), calculates an orthogonal vector to the path,
/// and returns the direction of the path at that point.
///
/// Arguments:
///     * `points_data` - A slice of `f32` containing x, y, z coordinates and thickness for each point defining the path.
///     * `alpha` - A float from 0.0 to 1.0 indicating the relative position along the path.
///
/// Returns:
///     * A tuple containing the interpolated position along the path as Vec4 (including thickness),
///       a vector orthogonal to the path, and the direction of the path at that position.
pub fn interpolate_along_path(points_data: &[f32], _alpha: f32) -> (Vec4, Vec3, Vec3) {
    let alpha = _alpha.min(0.999999).max(0.000001);
    assert!(
        points_data.len() % 4 == 0,
        "The points data must be a multiple of 4."
    );

    let num_points = points_data.len() / 4;
    assert!(
        num_points > 1,
        "There must be at least two points to define a path."
    );

    // Calculate the total length of the path and the lengths of each segment.
    let mut segment_lengths = Vec::with_capacity(num_points - 1);
    let mut total_length = 0.0;
    for i in 0..num_points - 1 {
        let start_index = i * 4;
        let end_index = (i + 1) * 4;
        let start_point = vec3(
            points_data[start_index],
            points_data[start_index + 1],
            points_data[start_index + 2],
        );
        let end_point = vec3(
            points_data[end_index],
            points_data[end_index + 1],
            points_data[end_index + 2],
        );
        let length = (end_point - start_point).length();
        segment_lengths.push(length);
        total_length += length;
    }

    // Find the target length along the path corresponding to `alpha`.
    let target_length = alpha * total_length;
    let mut accumulated_length = 0.0;

    // Find the segment that contains the point at `target_length`.
    for (i, &length) in segment_lengths.iter().enumerate() {
        if accumulated_length + length >= target_length {
            // Calculate the position within this segment.
            let segment_alpha = (target_length - accumulated_length) / length;
            let start_index = i * 4;
            let end_index = (i + 1) * 4;
            let start_point = vec4(
                points_data[start_index],
                points_data[start_index + 1],
                points_data[start_index + 2],
                points_data[start_index + 3],
            );
            let end_point = vec4(
                points_data[end_index],
                points_data[end_index + 1],
                points_data[end_index + 2],
                points_data[end_index + 3],
            );
            let position = start_point + (end_point - start_point) * segment_alpha;

            // Calculate the tangent vector to the path at this segment.
            let tangent = (end_point.xyz() - start_point.xyz()).normalize();

            // Calculate an orthogonal vector. Assume using the global up vector (0, 1, 0)
            let global_up = vec3(0.0, 1.0, 0.0);
            let orthogonal = tangent.cross(global_up).normalize();

            // If the orthogonal vector is zero, choose another axis.
            let orthogonal = if orthogonal.length_squared() == 0.0 {
                tangent.cross(vec3(1.0, 0.0, 0.0)).normalize()
            } else {
                orthogonal
            };

            return (position, orthogonal, tangent);
        }
        accumulated_length += length;
    }

    // As a fallback for numerical precision issues, use the last point and a default orthogonal vector.
    let last_start_index = (num_points - 2) * 4;
    let last_end_index = (num_points - 1) * 4;
    let last_start_point = vec4(
        points_data[last_start_index],
        points_data[last_start_index + 1],
        points_data[last_start_index + 2],
        points_data[last_start_index + 3],
    );
    let last_end_point = vec4(
        points_data[last_end_index],
        points_data[last_end_index + 1],
        points_data[last_end_index + 2],
        points_data[last_end_index + 3],
    );
    let last_tangent = (last_end_point.xyz() - last_start_point.xyz()).normalize();
    let last_orthogonal = last_tangent.cross(vec3(0.0, 1.0, 0.0)).normalize();
    (last_end_point, last_orthogonal, last_tangent)
}
