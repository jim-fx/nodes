use glam::{Quat, Vec3};

/// Rotates a vector around a given axis by a specified angle.
///
/// Arguments:
/// * `vector` - The vector to rotate.
/// * `axis` - The axis to rotate around.
/// * `angle_radians` - The angle to rotate by, in radians.
///
/// Returns:
/// * The rotated vector.
pub fn rotate_vector_by_angle(vector: Vec3, axis: Vec3, angle_radians: f32) -> Vec3 {
    // Normalize the axis to ensure it's a unit vector
    let normalized_axis = axis.normalize();

    // Create a quaternion representing the rotation around the axis by the given angle
    let rotation_quat = Quat::from_axis_angle(normalized_axis, angle_radians);

    // Rotate the vector using the quaternion
    rotation_quat.mul_vec3(vector)
}
