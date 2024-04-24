use std::f32::consts::PI;

use glam::Vec3;
use macros::include_definition_file;
use utils::{
    concat_arg_vecs, evaluate_float, evaluate_int,
    geometry::{create_path, get_direction_at_path, get_point_at_path, wrap_path, wrap_path_mut},
    log, set_panic_hook, split_args,
};
use wasm_bindgen::prelude::*;

include_definition_file!("src/input.json");

#[wasm_bindgen]
pub fn execute(input: &[i32]) -> Vec<i32> {
    set_panic_hook();

    let args = split_args(input);

    let paths = split_args(args[0]);

    let mut output: Vec<Vec<i32>> = Vec::new();

    let resolution = evaluate_int(args[8]).max(4) as usize;
    let depth = evaluate_int(args[6]);

    let mut max_depth = 0;
    for path_data in paths.iter() {
        if path_data[2] != 0 {
            continue;
        }
        max_depth = max_depth.max(path_data[3]);
    }

    for path_data in paths.iter() {
        // if this is not a path don't modify it
        if path_data[2] != 0 || path_data[3] < (max_depth - depth) {
            output.push(path_data.to_vec());
            continue;
        }

        let path = wrap_path(path_data);

        let branch_amount = evaluate_int(args[7]).max(1);

        let lowest_branch = evaluate_float(args[4]);
        let highest_branch = evaluate_float(args[5]);

        for i in 0..branch_amount {
            let a = i as f32 / (branch_amount - 1).max(1) as f32;

            let length = evaluate_float(args[1]);
            let thickness = evaluate_float(args[2]);
            let offset_single = evaluate_float(args[3]);

            // log!("a: {}, length: {}, thickness: {}, offset_single: {}, lowest_branch: {}, highest_branch: {}", a, length, thickness, offset_single, lowest_branch, highest_branch);

            // log!("a: {}, length: {}, thickness: {}, offset_single: {}, lowest_branch: {}, highest_branch: {}", a, length, thickness, offset_single, lowest_branch, highest_branch);
            let root_alpha = (a * (highest_branch - lowest_branch) + lowest_branch)
                .min(1.0)
                .max(0.0);

            let is_left = i % 2 == 0;

            let branch_origin = get_point_at_path(path.points, root_alpha);
            //const [_vx, , _vz] = interpolateSkeletonVec(stem.skeleton, a);
            let direction_slice = get_direction_at_path(path.points, root_alpha);
            let direction = Vec3::from_slice(&direction_slice).normalize();

            let rotation_angle = if is_left { PI } else { -PI };

            // check if diration contains NaN
            if direction[0].is_nan() || direction[1].is_nan() || direction[2].is_nan() {
                log!(
                    "BRANCH direction contains NaN: {:?}, slice: {:?} branch_origin: {:?}, branch: {}",
                    direction,
                    direction_slice,
                    branch_origin,
                    i
                );
                continue;
            }

            let branch_direction = Vec3::from_slice(&[
                direction[0] * rotation_angle.cos() - direction[2] * rotation_angle.sin(),
                0.0,
                direction[0] * rotation_angle.sin() + direction[2] * rotation_angle.cos(),
            ])
            .normalize();

            log!(
                "BRANCH depth: {}, branch_origin: {:?}, direction_at: {:?}, branch_direction: {:?}",
                depth,
                branch_origin,
                direction,
                branch_direction
            );
            let mut branch_data = create_path(resolution, depth + 1);
            let branch = wrap_path_mut(&mut branch_data);

            for j in 0..resolution {
                let _a = j as f32 / (resolution - 1) as f32;
                branch.points[j * 4] = branch_origin[0] + branch_direction[0] * _a * length;
                branch.points[j * 4 + 1] = branch_origin[1] + branch_direction[1] * _a * length;
                branch.points[j * 4 + 2] = branch_origin[2] + branch_direction[2] * _a * length;
                branch.points[j * 4 + 3] = branch_origin[3] * thickness * (1.0 - _a);
            }

            output.push(branch_data);
        }

        output.push(path_data.to_vec());
    }

    concat_arg_vecs(output)
}
