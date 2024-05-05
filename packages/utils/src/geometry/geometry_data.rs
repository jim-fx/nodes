use crate::log;

static GEOMETRY_HEADER_SIZE: usize = 3;
// 0: geometry type = 0
// 1: vertex amount
// 2: face amount

pub struct GeometryData<'a> {
    pub positions: &'a mut [f32], // View into `data`
    pub normals: &'a mut [f32],   // View into `data`
    pub faces: &'a mut [i32],     // View into `data`
}

impl GeometryData<'_> {
    pub fn set_position(&mut self, index: usize, x: f32, y: f32, z: f32) {
        assert!(index < self.positions.len() / 3, "Index out of bounds.");
        let i = index * 3;
        self.positions[i] = x;
        self.positions[i + 1] = y;
        self.positions[i + 2] = z;
    }
    pub fn set_normal(&mut self, index: usize, x: f32, y: f32, z: f32) {
        assert!(index < self.normals.len() / 3, "Index out of bounds.");
        let i = index * 3;
        self.normals[i] = x;
        self.normals[i + 1] = y;
        self.normals[i + 2] = z;
    }
    pub fn set_face(&mut self, index: usize, a: i32, b: i32, c: i32) {
        assert!(index < self.faces.len() / 3, "Index out of bounds.");
        let i = index * 3;
        self.faces[i] = a;
        self.faces[i + 1] = b;
        self.faces[i + 2] = c;
    }
}

pub fn create_geometry_data(vertex_amount: usize, face_amount: usize) -> Vec<i32> {
    let amount = GEOMETRY_HEADER_SIZE // definition (type, vertex_amount, face_amount)
      + 4 // opening and closing brackets
      + vertex_amount * 3  // positions
      + vertex_amount * 3  // normals
      + face_amount * 3; // faces

    let mut geo = vec![0; amount];

    log!(
        "create_geometry_data: vertices: {} faces: {}",
        vertex_amount,
        face_amount
    );

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
        geometry.len() > GEOMETRY_HEADER_SIZE,
        "Geometry vector does not contain enough data for a header."
    );

    // Split at after header
    let (header, rest) = geometry.split_at_mut(2 + GEOMETRY_HEADER_SIZE);

    let vertices_amount = header[3] as usize;
    let face_amount = header[4] as usize;
    let total_floats = vertices_amount * 3 * 2;

    let (faces, rest) = rest.split_at_mut(face_amount * 3);
    let (positions_slice, rest) = rest.split_at_mut(vertices_amount * 3);
    let (normals_slice, _) = rest.split_at_mut(vertices_amount * 3);

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
