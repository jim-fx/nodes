mod calculate_normals;
mod extrude_path;

pub use calculate_normals::*;
pub use extrude_path::*;

use crate::log;

#[rustfmt::skip]
pub fn create_empty_geometry(vertex_amount: usize, face_amount: usize) -> Vec<i32> {
    log!(
        "create_empty_geometry: vertex_amount: {}, face_amount: {}",
        vertex_amount,
        face_amount
    );

    let amount = 
        3 // definition (type, vertex_amount, face_amount)
      + 4 // opening and closing brackets
      + vertex_amount * 3  // positions
      + vertex_amount * 3  // normals
      + face_amount * 3;    // faces 

    let mut vec: Vec<i32> = vec![0; amount];
    vec[0] = 0; // opening bracket
    vec[1] = amount as i32 - 2; // opening bracket
    vec[2] = 1; // type: geometry
    vec[3] = vertex_amount as i32;
    vec[4] = face_amount as i32;
    vec[amount - 2] = 1; // closing bracket
    vec[amount - 1] = 1; // closing bracket
    vec
}
