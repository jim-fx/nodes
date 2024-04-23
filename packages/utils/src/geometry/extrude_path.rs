use super::{create_geometry_data, wrap_geometry_data};
use glam::{Mat4, Quat, Vec3};

fn create_circle(res: usize) -> Vec<f32> {
    let angle = (2.0 * std::f32::consts::PI) / res as f32;
    let mut circle = Vec::new();
    for i in 0..res {
        circle.push((angle * i as f32).cos());
        circle.push((angle * i as f32).sin());
    }
    circle
}

#[rustfmt::skip]
pub fn extrude_path(input_path: &[i32], res_x: usize) -> Vec<i32> {
    let point_amount = input_path.len() / 4;
    let face_amount = (point_amount - 1) * res_x * 2;
    let vertices_amount = point_amount * res_x;

    let circle = create_circle(res_x);

    let mut geometry_data = create_geometry_data(vertices_amount, face_amount);

    let geometry = wrap_geometry_data(&mut geometry_data);

    let normals = geometry.normals;
    let positions = geometry.positions;
    let indices = geometry.faces;

    let path: &[f32];
    unsafe {
        path = std::slice::from_raw_parts(input_path.as_ptr() as *const f32, input_path.len());
    }

    for i in 0..point_amount {

        let index_offset = i * res_x * 6;
        let position_offset = i * res_x;

        let point = Vec3::from_slice(&path[i*4..i*4+3]);
        let thickness = path[i*4+3];
        let next_point = if i == point_amount - 1 { point } else { Vec3::from_slice(&path[(i+1)*4..(i+1)*4+3]) };
        let prev_point = if i == 0 { point } else { Vec3::from_slice(&path[(i-1)*4..(i-1)*4+3]) };

        let mut v = if i == 0 {
            point - next_point
        } else if i == point_amount - 1 {
            prev_point - point
        } else {
            prev_point - next_point
        };
        v = v.normalize();

        let n = Vec3::new(0.0, -1.0, 0.0); // Assuming 'n' is the up vector or similar
        let axis = n.cross(v);
        let angle = n.dot(v).acos();

        let quat = Quat::from_axis_angle(axis, angle).normalize();
        let mat = Mat4::IDENTITY * Mat4::from_quat(quat);

        for j in 0..res_x {

            if i < point_amount - 1 {

                let i_index_offset = index_offset + j * 6;
                let i_position_offset = position_offset + j;

                //log!("i: {}, j: {}, i_index_offset: {}, i_position_offset: {} res_x: {}", i, j, i_index_offset, i_position_offset,res_x);

                if j == res_x - 1 {
                    indices[i_index_offset    ] = (i_position_offset + 1) as i32;
                    indices[i_index_offset + 1] = (i_position_offset + 1 - res_x) as i32;
                    indices[i_index_offset + 2] = (i_position_offset) as i32;
                    indices[i_index_offset + 3] = (i_position_offset) as i32;
                    indices[i_index_offset + 4] = (i_position_offset + res_x) as i32;
                    indices[i_index_offset + 5] = (i_position_offset + 1) as i32;
                } else {
                    indices[i_index_offset    ] = (i_position_offset + res_x + 1) as i32;
                    indices[i_index_offset + 1] = (i_position_offset + 1) as i32;
                    indices[i_index_offset + 2] = (i_position_offset) as i32;
                    indices[i_index_offset + 3] = (i_position_offset) as i32;
                    indices[i_index_offset + 4] = (i_position_offset + res_x) as i32;
                    indices[i_index_offset + 5] = (i_position_offset + res_x + 1) as i32;
                }
            }

            // construct the points
            let idx = i * res_x * 3 + j * 3;

            let circle_x = circle[j * 2    ] * thickness;
            let circle_y = circle[j * 2 + 1] * thickness;

            let _pt = Vec3::new(
                point[0] + circle_x,
                point[1],
                point[2] + circle_y,
            );

            let pt = Mat4::transform_vector3(&mat, _pt) + point;

            normals[idx    ] = circle_x;
            normals[idx + 1] = 0.0;
            normals[idx + 2] = circle_y;

            positions[idx    ] = pt[0];
            positions[idx + 1] = pt[1];
            positions[idx + 2] = pt[2];
        }
    }

    geometry_data
}
