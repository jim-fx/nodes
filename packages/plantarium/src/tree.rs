pub fn get_arg<'a>(index: i32, args: &'a Vec<i32>) -> Option<&'a [i32]> {
    let mut arg_index = -1;
    let mut i: usize = 0;
    let mut depth = 0;

    let mut arg_start_index = 0;
    let mut next_bracket_index = 0;

    while i < args.len() {
        println!("------");

        let is_bracket = i == next_bracket_index;
        let value = args[i];

        // if we are at a bracket
        if is_bracket {
            next_bracket_index = 1 + i + args[i + 1] as usize;
            // if is opening
            if value == 0 {
                if i != 0 {
                    depth += 1;
                }

                if depth == 0 {
                    i += 2;
                    arg_index += 1;
                } else {
                    i = next_bracket_index;
                }
            // if closing
            } else if value == 1 {
                depth -= 1;
                if depth > 1 {
                    i = next_bracket_index;
                } else {
                    i += 2;
                }
            }
            continue;
        }

        arg_index += 1;

        println!(
            "i: {}, next: {}, v: {}, ai: {}",
            i, next_bracket_index, args[i], arg_index
        );

        println!("is_bracket: {}", is_bracket);
        println!("depth: {}", depth);

        println!("arg_start_index: {}", arg_start_index);

        if arg_index == index {
            println!("------");
            return Some(&args[arg_start_index..=i]);
        }

        i += 1;
    }

    None
}

fn main() {
    let input_a = vec![0, 4, 1, 2, 3, 0, 7, 1, 2, 4, 2, 4, 1, 1, 1, 1];
    // -> [1, 2, 3, [1, 2, 4, 2, 4]]
    // 1: [1]
    // 2: [2]
    // 3: [3]
    // 4: [1,2,4,2,4]

    let input_b = vec![0, 2, 1, 0, 4, 4, 2, 4, 1, 2, 2, 0, 3, 2, 3, 1, 1, 1, 1];
    // -> [1,[4,2,4], 2, [2,3]];
    // 1: [1]
    // 2: [4,2,4]
    // 3: [2]
    // 4: [2,3]

    let input = input_b;

    //let first_arg = get_arg(0, &input);
    //println!("-----> FIRST: {:?}", first_arg);

    //let second_arg = get_arg(1, &input);
    //println!("-----> SECOND: {:?}", second_arg);

    //let third_arg = get_arg(2, &input);
    //println!("-----> THIRD: {:?}", third_arg);

    let fourth_arg = get_arg(3, &input);
    println!("-----> FOURTH: {:?}", fourth_arg);
}

