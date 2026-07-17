import ast
import os

models_dir = "/home/isabel-perez/portales/sitio2026/api/app/models"
for file in os.listdir(models_dir):
    if not file.endswith(".py"): continue
    path = os.path.join(models_dir, file)
    with open(path, "r") as f:
        tree = ast.parse(f.read())
    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            print(f"[{node.name}]")
            cols = []
            rels = []
            for item in node.body:
                if isinstance(item, ast.Assign) and len(item.targets) == 1:
                    target = item.targets[0]
                    if isinstance(target, ast.Name):
                        if isinstance(item.value, ast.Call) and isinstance(item.value.func, ast.Name):
                            if item.value.func.id == "Column":
                                cols.append(target.id)
                            elif item.value.func.id == "relationship":
                                rels.append(f"{target.id}_slugs")
            print("Cols:", ",".join([c for c in cols if c != "id"]))
            print("Rels:", ",".join(rels))
            print()
