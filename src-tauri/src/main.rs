#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri;
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};

fn main() {
    let builder = tauri::Builder::default();

    builder
        .plugin(TauriSql::default().add_migrations(
            "sqlite:firefly.db",
            vec![Migration {
                version: 1,
                description: "create message",
                sql: include_str!("../migrations/initial.sql"),
                kind: MigrationKind::Up,
            }],
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
