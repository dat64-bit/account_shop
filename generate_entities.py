import re
import os

sql_file = "ShopAccountDB_V1.sql"
out_dir = "account-shop/src/main/java/com/dat64bit/shop/accountshop/entity"

os.makedirs(out_dir, exist_ok=True)

with open(sql_file, "r", encoding="utf-8") as f:
    sql = f.read()

# remove comments
sql = re.sub(r'--.*', '', sql)

tables = re.findall(r'CREATE TABLE \[?(\w+)\]?\s*\((.*?)\);', sql, re.DOTALL | re.IGNORECASE)

type_map = {
    'INT': 'Integer',
    'NVARCHAR': 'String',
    'VARCHAR': 'String',
    'DECIMAL': 'java.math.BigDecimal',
    'DATETIME': 'java.time.LocalDateTime',
    'BIT': 'Boolean'
}

def camel_case(s, cap=False):
    parts = s.split('_')
    res = parts[0].lower() + ''.join(x.title() for x in parts[1:])
    if cap:
        res = res[0].upper() + res[1:]
    return res

count = 0
for table_name, table_body in tables:
    class_name = camel_case(table_name, True)
    
    lines = table_body.split('\n')
    fields = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('CONSTRAINT') or line.startswith('PRIMARY KEY'):
            continue
            
        parts = re.split(r'\s+', line)
        if len(parts) >= 2:
            col_name = parts[0].strip('[],')
            col_type_raw = parts[1].split('(')[0].upper().strip(',')
            
            if col_name.upper() == 'CONSTRAINT' or col_name.upper() == 'PRIMARY': continue
            
            java_type = type_map.get(col_type_raw, 'String')
            java_name = camel_case(col_name)
            
            is_id = 'PRIMARY KEY' in line.upper()
            
            fields.append((col_name, java_name, java_type, is_id))
            
    if not fields: continue
    
    # Generate Java class
    java_code = f"package com.dat64bit.shop.accountshop.entity;\n\n"
    java_code += f"import jakarta.persistence.*;\n"
    java_code += f"import lombok.*;\n"
    if any(f[2] == 'java.math.BigDecimal' for f in fields):
        java_code += f"import java.math.BigDecimal;\n"
    if any(f[2] == 'java.time.LocalDateTime' for f in fields):
        java_code += f"import java.time.LocalDateTime;\n"
        
    java_code += f"\n@Data\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n@Entity\n"
    
    # escape reserved words like 'order', 'transaction'
    table_annotation_name = table_name
    if table_name.lower() in ['order', 'transaction', 'user']:
        table_annotation_name = f"[{table_name}]"
        
    java_code += f"@Table(name = \"{table_annotation_name}\")\n"
    java_code += f"public class {class_name} {{\n\n"
    
    for col_name, java_name, java_type, is_id in fields:
        if is_id:
            java_code += f"    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n"
        java_code += f"    @Column(name = \"{col_name}\")\n"
        java_code += f"    private {java_type.split('.')[-1]} {java_name};\n\n"
        
    java_code += "}\n"
    
    with open(os.path.join(out_dir, f"{class_name}.java"), "w", encoding="utf-8") as f:
        f.write(java_code)
    count += 1
        
print(f"Generated {count} entity classes successfully!")
