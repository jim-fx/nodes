use crate::log;

pub struct GeometryData<'a> {
    pub positions: &'a mut [f32], // View into `data`
    pub normals: &'a mut [f32],   // View into `data`
    pub faces: &'a mut [i32],     // View into `data`
}

pub fn create_geometry_data(vertex_amount: usize, face_amount: usize) -> Vec<i32> {
    let amount = 3 // definition (type, vertex_amount, face_amount)
      + 4 // opening and closing brackets
      + vertex_amount * 3  // positions
      + vertex_amount * 3  // normals
      + face_amount * 3; // faces

    let mut geo = vec![0; amount];

    geo[0] = 0; // opening bracket
    geo[1] = amount as i32 - 2; // opening bracket
    geo[2] = 1; // type: geometry
    geo[3] = vertex_amount as i32;
    geo[4] = face_amount as i32;
    geo[amount - 2] = 1; // closing bracket
    geo[amount - 1] = 1; // closing bracket

    geo
}

pub fn wrap_geometry_data(geometry: &mut [i32]) -> GeometryData {
    // Basic validity checks
    assert!(
        geometry.len() > 5,
        "Geometry vector does not contain enough data for a header."
    );

    // Split at after header
    let (header, rest) = geometry.split_at_mut(5);

    let vertices_amount = header[3] as usize;
    let face_amount = header[4] as usize;
    let total_floats = vertices_amount * 3 * 2;

    let (faces, rest) = rest.split_at_mut(face_amount * 3);
    let (positions_slice, rest) = rest.split_at_mut(vertices_amount * 3);
    let (normals_slice, _) = rest.split_at_mut(vertices_amount * 3);

    log!(
        "Vertices: {}, normals: {}, Total floats: {}",
        positions_slice.len(),
        normals_slice.len(),
        total_floats
    );

    assert!(
        positions_slice.len() + normals_slice.len() == total_floats,
        "Slices do not match the expected sizes."
    );

    let positions: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(
            positions_slice.as_mut_ptr() as *mut f32,
            positions_slice.len(),
        )
    };
    let normals: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(normals_slice.as_mut_ptr() as *mut f32, normals_slice.len())
    };

    GeometryData {
        positions,
        normals,
        faces,
    }
}
