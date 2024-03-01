use node_registry_rust::NodeRegistryCore;
use tide::Request;

#[async_std::main]
async fn main() -> tide::Result<()> {
    let mut app = tide::new();
    app.at("/").get(index);
    app.at("/nodes/:author/:namespace/:node_id").get(get_node);
    app.listen("0.0.0.0:8080").await?;
    Ok(())
}

async fn get_node(req: Request<()>) -> tide::Result {
    let author = req.param("author")?;
    let namespace = req.param("namespace")?;
    let node_id = req.param("node_id")?;
    let node_registry = NodeRegistryCore::new("../../target/wasm32-unknown-unknown/release");

    if node_id.ends_with(".json") {
        Ok("asd".into())
    } else {
        let res = node_registry.get_node(author, namespace, node_id);

        match res {
            Ok(res) => Ok(format!("Hello {}", res.len()).into()),
            Err(er) => Ok(format!("Err: {}", er).into()),
        }
    }
}

async fn index(_req: Request<()>) -> tide::Result {
    Ok(format!("Hello {}", "World").into())
}
