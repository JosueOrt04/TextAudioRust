use std::fs;
use std::io::{self, Write};
use std::process::{Command, Stdio};
use std::path::Path;

fn main() {
    let folder = Path::new("Audios");
    if !folder.exists() {
        fs::create_dir(folder).expect("No se pudo crear la carpeta Audios");
    }

    loop {
        print!("Escribe el texto a convertir (o escribe 'salir' para terminar): ");
        io::stdout().flush().unwrap();
        let mut texto = String::new();
        io::stdin().read_line(&mut texto).expect("Error al leer la entrada");
        let texto = texto.trim();

        if texto.eq_ignore_ascii_case("salir") {
            println!("Saliendo del programa...");
            break;
        }

        print!("Escribe el nombre del archivo (sin extensión): ");
        io::stdout().flush().unwrap();
        let mut nombre_archivo = String::new();
        io::stdin().read_line(&mut nombre_archivo).expect("Error al leer la entrada");
        let nombre_archivo = nombre_archivo.trim();

        let ruta_wav = format!("Audios/{}.wav", nombre_archivo);
        let ruta_mp3 = format!("Audios/{}.mp3", nombre_archivo);

        // Usar Piper para generar voz más humana
        let mut child = Command::new("piper")
            .args(&["--model", "es_ES", "--output_file", &ruta_wav])
            .stdin(Stdio::piped())
            .spawn()
            .expect("Fallo al ejecutar Piper");

        child.stdin.as_mut().unwrap().write_all(texto.as_bytes()).unwrap();
        let _ = child.wait();

        if Path::new(&ruta_wav).exists() {
            println!("Archivo WAV generado: {}", ruta_wav);

            let output = Command::new("lame")
                .args(&[&ruta_wav, &ruta_mp3])
                .output()
                .expect("Error al convertir a MP3");

            if output.status.success() {
                println!("Archivo MP3 guardado en {}\n", ruta_mp3);
                fs::remove_file(&ruta_wav).expect("No se pudo eliminar el archivo WAV");
            } else {
                eprintln!("Error al convertir a MP3\n");
            }
        } else {
            eprintln!("Error al generar el archivo WAV\n");
        }
    }
}
