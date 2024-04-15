pub fn get_args(args: &[i32]) -> Vec<&[i32]> {
    let mut idx: usize = 0;
    let mut depth = -1;

    let mut arg_start_index = 2;
    let mut next_bracket_index = 0;
    let mut last_bracket_index = 0;

    let mut out_args: Vec<&[i32]> = Vec::new();

    let length = args.len();

    while idx < length {
        let is_bracket = idx == next_bracket_index;
        let value = args[idx];

        // if we are at a bracket
        if is_bracket {
            // if we are at the end of the args
            if idx >= length - 1 {
                break;
            }

            last_bracket_index = next_bracket_index;
            next_bracket_index = 1 + idx + args[idx + 1] as usize;

            if value == 0 {
                depth += 1;
            } else if value == 1 {
                depth -= 1;
            }

            if depth == 0 {
                // skip over the bracket encoding
                idx += 2;
            } else {
                // skip to the next bracket if we are at depth > 0
                idx = next_bracket_index - 1;
            }

            continue;
        }

        // this is at the end of args where normally multiple ] are encoded
        if depth < 0 {
            break;
        }

        // remove starting bracket from single numbers
        if idx - arg_start_index < 3 && last_bracket_index == arg_start_index {
            arg_start_index += 2;
        }

        out_args.push(&args[arg_start_index..=idx]);

        idx += 1;
        arg_start_index = idx;
    }

    out_args
}

pub fn evaluate_node(input_args: &[i32]) -> (i32, i32) {
    let node_type = input_args[0];

    match node_type {
        0 => crate::nodes::math_node(&input_args[1..]),
        _ => (0, 0),
    }
}

pub fn evaluate_args(input_args: &[i32]) -> (i32, i32) {
    let args = get_args(input_args);

    let mut resolved: Vec<i32> = Vec::new();

    for arg in args {
        if arg.len() == 1 {
            resolved.push(arg[0]);
        } else {
            let res = evaluate_args(arg);
            resolved.push(res.0);
            resolved.push(res.1);
        }
    }

    if resolved.len() > 1 {
        evaluate_node(&resolved)
    } else {
        (resolved[0], resolved[1])
    }
}

#[cfg(test)]
mod tests {

    use crate::encoding::decode_float;

    use super::*;

    #[test]
    fn test_resursive_evaluation() {
        let input = vec![0, 3, 0, 0, 0, 7, 0, 2, 0, 128, 0, 128, 1, 6, 0, 128];
        // this is an encoded version of a math node that multiplies 2 * 2
        // and another math node that adds 2 to that result
        // the numbers are f32 floats encoded as two i32's

        let result = evaluate_args(&input);
        let decoded = decode_float(result.0, result.1);

        assert_eq!(decoded, 6.0);
    }

    #[test]
    fn test_example_input_a() {
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
    fn test_example_input_b() {
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
}
