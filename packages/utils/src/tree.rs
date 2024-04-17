pub fn get_args(args: &[i32]) -> Vec<&[i32]> {
    let mut idx: usize = 0;
    let mut depth = -1;

    let mut next_bracket_index = 0;

    let mut out_args: Vec<&[i32]> = Vec::new();

    let length = args.len();

    let mut arg_start_index = 2;

    while idx < length {
        let is_bracket = idx == next_bracket_index;
        let value = args[idx];

        // if we are at a bracket
        if is_bracket {
            // if we are at the end of the args
            if idx >= length - 1 {
                break;
            }

            next_bracket_index = 1 + idx + args[idx + 1] as usize;

            if value == 0 {
                depth += 1;
            } else if value == 1 {
                depth -= 1;
            }

            if depth == 0 {
                if value == 1 {
                    out_args.push(&args[arg_start_index..idx]);
                    arg_start_index = idx + 2;
                }
                // skip over the bracket encoding
                idx += 2;
            } else {
                // skip to the next bracket if we are at depth > 0
                idx = next_bracket_index;
            }
            continue;
        }

        out_args.push(&args[arg_start_index..=idx]);
        arg_start_index = idx + 1;

        // this is at the end of args where normally multiple ] are encoded
        if depth < 0 {
            break;
        }

        idx += 1;
    }

    out_args
}

pub fn concat_args(mut data: Vec<Vec<i32>>) -> Vec<i32> {
    let mut total_length = 4; // Start with 4 to account for [0, 1] at the start and [1, 1] at the end

    // Calculate the total length first to avoid reallocations
    for vec in &data {
        total_length += vec.len(); // +4 for [0, 1] and [1, 1] per inner vec
    }

    let mut result = Vec::with_capacity(total_length);

    // Add [0, 1] initially
    // result.push(0);
    // result.push(1);

    // Process each vector
    for vec in data.iter_mut() {
        result.push(0);
        result.push(1);
        result.append(vec);
        result.push(1);
        result.push(1);
    }

    // Add [1, 1] at the end
    // result.push(1);
    result.push(1);

    result
}

pub fn wrap_arg(arg: &[i32]) -> Vec<i32> {
    let mut out_args = Vec::with_capacity(arg.len() + 8);
    out_args.extend_from_slice(&[0, 1, 0, arg.len() as i32 + 1]);
    out_args.extend_from_slice(arg);
    out_args.extend_from_slice(&[1, 1]);
    out_args.extend_from_slice(&[1, 1]);
    out_args
}

pub fn evaluate_node(input_args: &[i32]) -> i32 {
    let node_type = input_args[0];

    match node_type {
        0 => crate::nodes::math_node(&input_args[1..]),
        _ => 0,
    }
}

pub fn evaluate_args(input_args: &[i32]) -> Vec<i32> {
    if input_args.len() == 1 {
        return input_args.to_vec();
    }

    if input_args.len() == 4 && input_args[0] == 0 && input_args[1] == 3 {
        return vec![input_args[2], input_args[3]];
    }

    let args = get_args(input_args);

    let mut resolved: Vec<i32> = Vec::new();

    for arg in args {
        if arg.len() == 1 {
            resolved.push(arg[0]);
        } else if arg.len() == 4 && arg[0] == 0 && arg[1] == 3 {
            resolved.push(arg[2]);
            resolved.push(arg[3]);
        } else {
            resolved.push(evaluate_args(arg)[0]);
        }
    }

    if resolved.len() > 1 {
        let res = evaluate_node(&resolved);
        vec![res]
    } else {
        resolved
    }
}
#[cfg(test)]
mod tests {

    use crate::encoding::decode_float;

    use super::*;

    #[test]
    fn test_recursive_evaluation() {
        let input = vec![
            0, 3, 0, 0, 0, 5, 0, 2, 1073741824, 1073741824, 1, 5, 1073741824,
        ];
        // this is an encoded version of a math node that multiplies 2 * 2
        // and another math node that adds 2 to that result
        // the numbers are f32 floats encoded as two i32's

        let result = evaluate_args(&input);
        let decoded = decode_float(result[0]);

        assert_eq!(decoded, 6.0);
    }

    #[test]
    fn test_get_args_input_a() {
        let input_a = vec![0, 4, 1, 2, 3, 0, 7, 1, 2, 4, 2, 4, 1, 1, 1, 1];
        // -> [1, 2, 3, [1, 2, 4, 2, 4]]

        let args = get_args(&input_a);

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

        let args = get_args(&input_b);

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

        let args = get_args(&input);

        assert_eq!(args.len(), 4);
        assert_eq!(args[0], [0]);
        assert_eq!(args[1], [2]);
        assert_eq!(args[3], [0, 3, 0, 128]);

        let nested_args = get_args(args[2]);

        assert_eq!(nested_args.len(), 4);
    }
}
