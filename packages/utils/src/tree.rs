use crate::decode_float;

pub fn split_args(args: &[i32]) -> Vec<&[i32]> {
    let mut out_args: Vec<&[i32]> = Vec::new();
    let mut depth = 0;
    let mut i = 0;
    let mut start_index = 0;
    let mut next_bracket_index = 0;
    let len = args.len();

    while i < len {
        // check if we are at a bracket
        if i == next_bracket_index {
            next_bracket_index = i + args[i + 1] as usize + 1;
            // check if the bracket is opening
            if args[i] == 0 {
                if depth == 1 {
                    start_index = i;
                }
                depth += 1;
            } else {
                depth -= 1;
                if depth == 1 {
                    out_args.push(&args[start_index..i + 2]);
                    start_index = i + 2;
                }
            }
            i += 2;
            continue;
        } else if depth == 1 {
            out_args.push(&args[i..i + 1]);
            start_index = i + 1;
        }
        i += 1;
    }

    out_args
}

pub fn concat_arg_vecs(data: Vec<Vec<i32>>) -> Vec<i32> {
    let mut total_length = 4; // Start with 4 to account for [0, 1] at the start and [1, 1] at the end

    // Calculate the total length first to avoid reallocations
    for vec in &data {
        if vec.len() == 1 {
            total_length += 1;
        } else {
            total_length += vec.len(); // +4 for [0, 1] and [1, 1] per inner vec
        }
    }

    let mut result = Vec::with_capacity(total_length);

    // Add [0, 1] initially
    result.push(0);
    result.push(1);

    let mut last_closing_bracket = 1;

    // Process each vector
    for vec in data {
        if vec.len() == 1 {
            result.push(vec[0]);
            result[last_closing_bracket] += 1;
            continue;
        } else {
            result.extend(vec);
            last_closing_bracket = result.len() - 1;
            result[last_closing_bracket] = 1;
        }
    }

    // Add [1, 1] at the end
    result.push(1);
    result.push(1);

    result
}

pub fn concat_args(mut data: Vec<&[i32]>) -> Vec<i32> {
    let mut total_length = 4; // Start with 4 to account for [0, 1] at the start and [1, 1] at the end

    // Calculate the total length first to avoid reallocations
    for vec in &data {
        if vec.len() == 1 {
            total_length += 1;
        } else {
            total_length += vec.len(); // +4 for [0, 1] and [1, 1] per inner vec
        }
    }

    let mut result = Vec::with_capacity(total_length);

    // Add [0, 1] initially
    result.push(0);
    result.push(1);

    let mut last_closing_bracket = 1;

    // Process each vector
    for vec in data.iter_mut() {
        if vec.len() == 1 {
            result.push(vec[0]);
            result[last_closing_bracket] += 1;
            continue;
        } else {
            result.extend_from_slice(vec);
            last_closing_bracket = result.len() - 1;
            result[last_closing_bracket] = 1;
        }
    }

    // Add [1, 1] at the end
    result.push(1);
    result.push(1);

    result
}

pub fn wrap_arg(arg: &[i32]) -> Vec<i32> {
    let mut out_args = Vec::with_capacity(arg.len() + 4);
    out_args.push(0);
    out_args.push(arg.len() as i32 + 1);
    out_args.extend_from_slice(arg);
    out_args.push(1);
    out_args.push(1);
    out_args
}

pub fn evaluate_node(input_args: &[i32]) -> i32 {
    let node_type = input_args[0];

    match node_type {
        0 => crate::nodes::math_node(&input_args[1..]),
        1 => crate::nodes::random_node(&input_args[1..]),
        _ => 0,
    }
}

pub fn evaluate_vec3(input_args: &[i32]) -> Vec<f32> {
    if input_args.len() == 3 {
        return vec![
            decode_float(input_args[0]),
            decode_float(input_args[1]),
            decode_float(input_args[2]),
        ];
    }

    let args = split_args(input_args);

    assert!(
        args.len() == 3,
        "Failed to evaluate Vec3 - Expected 3 arguments, got {} \n {:?}",
        args.len(),
        args
    );

    let x = evaluate_float(args[0]);
    let y = evaluate_float(args[1]);
    let z = evaluate_float(args[2]);

    vec![x, y, z]
}

pub fn evaluate_float(arg: &[i32]) -> f32 {
    let res = decode_float(evaluate_int(arg));
    if res.is_nan() {
        0.0
    } else {
        res
    }
}

pub fn evaluate_int(input_args: &[i32]) -> i32 {
    if input_args.len() == 1 {
        return input_args[0];
    }

    let args = split_args(input_args);

    let mut resolved: Vec<i32> = Vec::new();

    for arg in args {
        if arg.len() == 1 {
            resolved.push(arg[0]);
        } else if arg.len() == 4 && arg[0] == 0 && arg[1] == 3 {
            resolved.push(arg[2]);
            resolved.push(arg[3]);
        } else {
            resolved.push(evaluate_int(arg));
        }
    }

    if resolved.len() > 1 {
        evaluate_node(&resolved)
    } else {
        resolved[0]
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[rustfmt::skip]
    #[test]
    fn test_split_args() {
        let input = [
            0, 1, 0, 28, 0, 2, 1048576000, 0, 20, 0, 4, 0, 0, 1073741824, 0, 9, 0, 5, 0, 0,
            1073741824, 1073741824, 1, 1, 1, 0, 1, 1, 1, 4, 1041865114, 1, 5, 1086324736,
            1053609165, 54,
        ];

        let args = split_args(&input);
        println!("{:?}", args[0]);

        assert_eq!(args[0].len(), 29);
        assert_eq!(args[1][0], 1086324736);
        assert_eq!(args[2][0], 1053609165);
    }

    #[test]
    fn test_recursive_evaluation() {
        let input = vec![
            0, 3, 0, 0, 0, 5, 0, 2, 1073741824, 1073741824, 1, 5, 1073741824,
        ];
        // this is an encoded version of a math node that multiplies 2 * 2
        // and another math node that adds 2 to that result
        // the numbers are f32 floats encoded as two i32's

        let result = evaluate_float(&input);

        assert_eq!(result, 6.0);
    }

    #[test]
    fn test_get_args_input_a() {
        let input_a = vec![0, 4, 1, 2, 3, 0, 7, 1, 2, 4, 2, 4, 1, 1, 1, 1];
        // -> [1, 2, 3, [1, 2, 4, 2, 4]]

        let args = split_args(&input_a);

        println!("{:?}", args);

        assert_eq!(args.len(), 4);
        assert_eq!(args[0], [1]);
        assert_eq!(args[1], [2]);
        assert_eq!(args[2], [3]);
        assert_eq!(args[3], [0, 7, 1, 2, 4, 2, 4, 1]);
    }

    #[test]
    fn test_get_args_input_b() {
        let input_b = vec![0, 3, 7, 1, 0, 4, 4, 2, 4, 1, 2, 2, 0, 3, 2, 3, 1, 1, 1, 1];
        // -> [1,[4,2,4], 2, [2,3]]

        let args = split_args(&input_b);

        assert_eq!(args.len(), 5);
        assert_eq!(args[0], [7]);
        assert_eq!(args[1], [1]);
        assert_eq!(args[2], [0, 4, 4, 2, 4]);
        assert_eq!(args[3], [2]);
        assert_eq!(args[4], [0, 3, 2, 3]);
    }

    #[test]
    fn test_get_args_nested_inputs() {
        let input = vec![
            0, 3, 0, 2, 0, 3, 0, 0, 0, 3, 7549747, 127, 1, 1, 0, 3, 0, 128, 1, 1, 1, 1, 0, 3, 0,
            128, 1, 1, 1, 1,
        ];

        // each math node has 4 numbers
        // 0 -> type of node (0 -> math node)
        // 1 -> op_type for math operation (0 -> add, 1 -> sub, 2 -> mul, 3 -> div)
        // 2 -> first number
        // 3 -> second number

        let args = split_args(&input);

        assert_eq!(args.len(), 4);
        assert_eq!(args[0], [0]);
        assert_eq!(args[1], [2]);
        assert_eq!(args[3], [0, 3, 0, 128]);

        let nested_args = split_args(args[2]);

        assert_eq!(nested_args.len(), 4);
    }
}
