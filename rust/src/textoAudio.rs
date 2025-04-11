use std::fs;
use std::io::{self, Write};
use std::process::Command;
use std::path::Path;

fn main() {
    // Crear la carpeta 'Audios' si no existe
    let folder = Path::new("Audios");
    if !folder.exists() {
        fs::create_dir(folder).expect("No se pudo crear la carpeta Audios");
    }

    loop {
        // Pedir el texto al usuario
        print!("Escribe el texto a convertir (o escribe 'salir' para terminar): ");
        io::stdout().flush().unwrap();
        let mut texto = String::new();
        io::stdin().read_line(&mut texto).expect("Error al leer la entrada");
        let texto = texto.trim();

        // Verificar si el usuario quiere salir
        if texto.eq_ignore_ascii_case("salir") {
            println!("Saliendo del programa...");
            break;
        }

        // Pedir el nombre del archivo
        print!("Escribe el nombre del archivo (sin extensión): ");
        io::stdout().flush().unwrap();
        let mut nombre_archivo = String::new();
        io::stdin().read_line(&mut nombre_archivo).expect("Error al leer la entrada");
        let nombre_archivo = nombre_archivo.trim();

        // Rutas de los archivos
        let ruta_wav = format!("Audios/{}.wav", nombre_archivo);
        let ruta_mp3 = format!("Audios/{}.mp3", nombre_archivo);

        // Generar archivo WAV con espeak-ng ajustando velocidad y entonación
        let output = Command::new("espeak-ng")
            .args(&["-v", "es-la", "-s", "150", "-p", "60", "-w", &ruta_wav, texto])
            .output()
            .expect("Fallo al ejecutar espeak-ng");

        if output.status.success() {
            println!("Archivo WAV generado: {}", ruta_wav);

            // Convertir WAV a MP3 con lame
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
