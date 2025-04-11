use std::env;
use std::fs;
use std::process::Command;
use std::path::Path;

fn main() {
    // Ruta relativa desde src/ hacia public/Audios
    let carpeta = Path::new("../public/Audios");
    if !carpeta.exists() {
        fs::create_dir_all(&carpeta).expect("No se pudo crear la carpeta Audios");
    }

    // Captura los argumentos desde la línea de comando (los pasa Node.js)
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run -- <texto> <nombre_archivo>");
        std::process::exit(1);
    }

    let texto = &args[1];
    let nombre_archivo = &args[2];

    let ruta_wav = format!("../public/Audios/{}.wav", nombre_archivo);
    let ruta_mp3 = format!("../public/Audios/{}.mp3", nombre_archivo);

    // Generar archivo WAV con espeak-ng
    let output = Command::new("espeak-ng")
        .args(&["-v", "es", "-w", &ruta_wav, texto])
        .output()
        .expect("Fallo al ejecutar espeak-ng");

    if output.status.success() {
        println!("WAV generado correctamente.");

        // Convertir WAV a MP3 con lame
        let output = Command::new("lame")
            .args(&[&ruta_wav, &ruta_mp3])
            .output()
            .expect("Error al convertir a MP3");

        if output.status.success() {
            println!("MP3 generado exitosamente.");
            fs::remove_file(&ruta_wav).expect("No se pudo eliminar el archivo WAV");
        } else {
            eprintln!("Error al convertir a MP3");
            std::process::exit(1);
        }
    } else {
        eprintln!("Error al generar el archivo WAV");
        std::process::exit(1);
    }
}
