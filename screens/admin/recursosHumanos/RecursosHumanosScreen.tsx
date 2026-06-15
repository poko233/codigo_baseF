import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import UsuarioEditModal from "./components/UsuarioEditModal";
import UsuariosTable from "./components/UsuariosTable";
import { useRecursosHumanos } from "./hooks/useRecursosHumanos";
import { FotoUsuarioArchivo, UsuarioRRHH } from "./types/recursosHumanos.types";

export default function RecursosHumanosScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    usuarios,
    loading,
    guardando,
    cargandoDetalle,
    cargarUsuarios,
    guardarUsuario,
    cargarDetalleUsuario,
    actualizarFotoUsuario,
  } = useRecursosHumanos();

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRRHH | null>(
    null,
  );

  const abrirEditar = async (usuario: UsuarioRRHH) => {
    setUsuarioEditando(usuario);

    const detalle = await cargarDetalleUsuario(usuario.id);

    if (detalle) {
      setUsuarioEditando(detalle);
    }
  };

  const cerrarEditar = () => {
    setUsuarioEditando(null);
  };

  const refrescarDetalleEditando = async (id: number) => {
    const detalle = await cargarDetalleUsuario(id);

    if (detalle) {
      setUsuarioEditando(detalle);
    }

    await cargarUsuarios();
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <ThemedText style={styles.kicker}>Recursos humanos</ThemedText>

          <ThemedText style={styles.title}>
            Gestión general de usuarios
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Administra, edita y revisa los datos, documentos, QR y foto de los
            usuarios registrados en el sistema.
          </ThemedText>
        </View>

        <UsuariosTable
          usuarios={usuarios}
          loading={loading}
          onEditar={abrirEditar}
          onRefresh={cargarUsuarios}
        />
      </ScrollView>

      <UsuarioEditModal
        visible={!!usuarioEditando}
        usuario={usuarioEditando}
        guardando={guardando}
        cargandoDetalle={cargandoDetalle}
        onClose={cerrarEditar}
        onSave={guardarUsuario}
        onFotoActualizada={async (id: number, archivo: FotoUsuarioArchivo) => {
          const actualizado = await actualizarFotoUsuario(id, archivo);

          if (actualizado) {
            setUsuarioEditando(actualizado);
            await cargarUsuarios();
          }
        }}
        onDocumentoSubido={async (id: number) => {
          await refrescarDetalleEditando(id);
        }}
      />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: 20,
      gap: 18,
      backgroundColor: colors.background,
    },
    hero: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
    },
    kicker: {
      color: colors.primary,
      fontWeight: "900",
      textTransform: "uppercase",
      fontSize: 12,
      letterSpacing: 1,
    },
    title: {
      marginTop: 8,
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      color: colors.textSecondary,
      maxWidth: 760,
      lineHeight: 21,
      fontSize: 15,
    },
  });
}
