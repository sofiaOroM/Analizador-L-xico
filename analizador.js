function openFile() {
    const fileInput = document.getElementById("file-input");
    fileInput.click(); 
}

// Cargar el archivo
document.getElementById("file-input").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (doc) {
            const content = doc.target.result;
            document.getElementById("editor").value = content; 
        };
        reader.readAsText(file);
    }
});

function buscarPalabra(){
    let texto = document.getElementById("editor").value;
    let busqueda = document.getElementById("search-input").value.trim();

    if (busqueda === ""){
        alert("Por favor, ingrese una palabra para buscar");
        return;
    }

    let textoResaltado = "";
    let coincidencias = 0;
    let lexemaActual = "";
    let i =  0;

    while (i < texto.length) {
        let char = texto[i];
        if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
            lexemaActual += char;
        } else {
            if (lexemaActual.toLowerCase() === busqueda.toLowerCase()) {
                textoResaltado += `<mark>${lexemaActual}</mark>`;
                coincidencias++;
            } else {
                textoResaltado += lexemaActual; 
            }
            textoResaltado += char; 
            lexemaActual = "";
        }
        i++;        
    }

    if (lexemaActual.toLowerCase() === busqueda.toLowerCase()){
        textoResaltado += `<mark>${lexemaActual}</mark>`; 
        coincidencias++;
    } else {
        textoResaltado += lexemaActual;
    }
    textoResaltado = textoResaltado.replace(/\n/g, "<br>");


    document.getElementById("resultado-busqueda").innerHTML =  `<h4>La palabra "${busqueda}" aparece ${coincidencias} veces.</h4>`;
    document.getElementById("resultado-busqueda").innerHTML += `<div class="texto-resaltado">${textoResaltado}</div>`;
    document.getElementById("resultado-busqueda").style.display = "block";
}

function analizarTexto(){
    let texto = document.getElementById("editor").value;

    let tokens = [];
    let errores = [];
    let lexemaCount = {};

    let lexema = "";
    let fila = 1;
    let columna = 0;

    if (texto.trim() === "") {
        alert("Por favor, ingrese o cargue un texto para analizar.");
        return;
    }    

    document.getElementById("resultado-busqueda").style.display = "none";


    for(let i=0; i< texto.length; i++) {
        let char = texto[i];
        columna++;

        if(char == "\n"){
            fila++;
            columna = 0;
            continue;
        }

        if((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')){
            lexema += char;
            while(i+1 < texto.length && ((texto[i+1] >= 'a' && texto[i+1] <= 'z') || 
                    (texto[i+1] >= 'A' && texto[i+1] <= 'Z') || 
                    (texto[i+1] >= '0' && texto[i+1] <= '9'))){
                lexema += texto[++i];
                columna++;
            }
            if (lexema === "AND" || lexema === "OR"){
                tokens.push({tipo: "Operador Lógico", lexema, fila, columna});
            } else {
                tokens.push({ tipo: "Identificador", lexema,fila,columna });
            }
            lexema = "";
            lexemaCount[char] = (lexemaCount[char] || 0) + 1;
            continue;
        }

        if(char >= '0' && char <= '9'){
            lexema += char;
            while (i+1< texto.length && (texto[i+1] >= '0' && texto[i+1] <= '9')){
                lexema += texto[++i];
                columna++;
            }
            if(i+1 < texto.length && texto[i + 1] === "." && (texto[i+2] >= '0' && texto[i+2] <= '9')){
                lexema += texto[++i];
                columna++;
                while ( i + 1 < texto.length && (texto[i + 1] >= '0' && texto[i + 1] <= '9')){
                    lexema += texto[++i];
                    columna++;
                }
                tokens.push({ tipo: "Número Decimal", lexema, fila, columna})
            } else {
                tokens.push({ tipo: " Número Entero", lexema, fila, columna})
            }
            lexema = "";
            lexemaCount[char] = (lexemaCount[char] || 0) + 1;
            continue;            
        }

        if(char === '.' || char === ',' || char === ';' || char === ':' || char === '-') {
            tokens.push({ tipo: "Puntuación", lexema: char, fila, columna});
            lexemaCount[char] = (lexemaCount[char] || 0) + 1;
            continue;
        }

        if(char === '+' || char === '-' || char === '*' || char === '/' || char === '^') {
            tokens.push({ tipo: "Operador Aritmético", lexema: char, fila,columna});
            lexemaCount[char] = (lexemaCount[char] || 0) + 1;
            continue;
        }

        
        if (char === "&" && texto[i + 1] === "&") {
            tokens.push({ tipo: "Operador Lógico", lexema: "&&", fila, columna });
            lexemaCount["&&"] = (lexemaCount["&&"] || 0) + 1;
            i++; 
            columna++;
            continue;
        }

        if (char === "|" && texto[i + 1] === "|") {
            tokens.push({ tipo: "Operador Lógico", lexema: "||", fila, columna });
            lexemaCount["||"] = (lexemaCount["||"] || 0) + 1;
            i++;
            columna++;
            continue;
        }

        if (char === '<' || char === '>' || char === '=' || char === '<=' || char === '>=' || char === '==') {
            let operador = char;
            if (texto[i + 1] === "=") {
                operador += "=";
                i++;
                columna++;
                tokens.push({ tipo: "Operador Relacional", lexema: operador, fila, columna });
            } else if (char === "="){
                tokens.push({tipo: "Operador de Asignación", lexema: "=", fila, columna});
            } else if (char === "<" || char === ">" ) {
                tokens.push({ tipo: "Operador Relacional", lexema: operador, fila, columna });
            }
            lexemaCount[operador] = (lexemaCount[operador] || 0) + 1;
            continue;
        }

        if (char === '[' || char === ']' || char === '(' || char === ')' || char === '{' || char === '}') {
            tokens.push ({ tipo: "Agrupación", lexema: char, fila, columna})
            lexemaCount[char] = (lexemaCount[char] || 0) + 1;
            continue;
        }

        if (char === ' ' || char === '\t' || char === '\n' || char === '\r'){
            continue;
        }

        errores.push({ simbolo: char, fila, columna});        
    }
    console.log("Texto a analizar:", texto);


    mostrarResultado(tokens, errores);
    console.log("texto analizado", resultado);

}

function mostrarResultado(tokens, errores){
    let resultadoHTML = "<h3>Resultado del Análisis Léxico</h3>";

    document.getElementById("recuento-lexemas").innerHTML = "";
    document.getElementById("recuento-lexemas").style.display = "none";
        
    if(errores.length > 0) {
        resultadoHTML += "<h4>Errores Encontrados</h4><table class='errores'>><tr><th>Simbolo</th><th>Fila</th><th>Columna</th></tr>";
        errores.forEach(error => {
            resultadoHTML += `<tr><td>${error.simbolo}</td><td>${error.fila}</td><td>${error.columna}</td></tr>`;       
            console.log("Error encontrado");
     
        });
        resultadoHTML += "</table>";
        
        document.getElementById("btn-lexemas").disabled = "none"; 
        document.getElementById("btn-lexemas").dataset.lexemas = ""; // BORRAR DATOS VIEJOS
 
    } else {
        resultadoHTML += "<h4>Reporte de Tokens</h4><table class='tokens'><tr><th>Token</th><th>Lexema</th><th>Fila</th><th>Columna</th></tr>";
        tokens.forEach(token => {
            resultadoHTML += `<tr><td>${token.tipo}</td><td>${token.lexema}</td><td>${token.fila}</td><td>${token.columna}</td></tr>`;   
            console.log("Errores no encontrados");
         
        });
        resultadoHTML += "</table>";

        document.getElementById("btn-lexemas").disabled = false;

        let lexemaCount = {};
        tokens.forEach(token => {
            lexemaCount[token.lexema] = (lexemaCount[token.lexema] || 0 ) + 1;
        });
        // dataset (convertido a JSON)
        document.getElementById("btn-lexemas").dataset.lexemas = JSON.stringify(lexemaCount);
        console.log("LexemaCount almacenado:", lexemaCount);
    }
    document.getElementById("resultado").innerHTML = resultadoHTML;
}    

//verificación para parsear JSON para evitar errores
function contarLexemas() {
    let btnLexemas = document.getElementById("btn-lexemas");

    //Validar si dataset.lexemas tiene datos antes de parsear
    if (!btnLexemas.dataset.lexemas) {
        console.error("Error: No hay datos de lexemas almacenados.");
        return;
    }

    let lexemaCount = JSON.parse(btnLexemas.dataset.lexemas);

    let tablaLexemas = "<h4>Recuento de Lexemas</h4><table class ='recuento'><tr><th>Lexema</th><th>Cantidad</th></tr>";

    for (let lexema in lexemaCount) {
        tablaLexemas += `<tr><td>${lexema}</td><td>${lexemaCount[lexema]}</td></tr>`;
    }

    tablaLexemas += "</table>";
    document.getElementById("recuento-lexemas").innerHTML = tablaLexemas;
}

function mostrarLexemas() {
    contarLexemas();
    document.getElementById("recuento-lexemas").style.display = "block";
}

function exportarTexto() {
    let texto = document.getElementById("editor").value; // Obtener el texto del área de entrada

    if (texto.trim() === "") {
        alert("No hay texto para exportar.");
        return;
    }

    let blob = new Blob([texto], { type: "text/plain" }); // Crear un archivo de texto
    let enlace = document.createElement("a"); // Crear un enlace oculto
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "texto_exportado.txt"; // Nombre del archivo
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace); // Eliminar el enlace después de la descarga
}