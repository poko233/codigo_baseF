import * as FileSystemNS from "expo-file-system";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import { Download } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const QrProfileCard = () => {
  const { theme } = useTheme();
  const { codigoQr } = usePerfilData();
  const styles = getStyles(theme);

  const handleDownload = async () => {
    if (!codigoQr) return;

    try {
      const base64Data = codigoQr.includes(",")
        ? codigoQr.split(",")[1]
        : codigoQr;

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = codigoQr;
        link.download = "qr_identidad.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Hack temporal por tipos desactualizados de expo-file-system
        const FileSystem = FileSystemNS as any;
        const fileUri = FileSystem.cacheDirectory + "qr_identidad.png";
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "image/png",
            dialogTitle: "Guardar ID Digital",
            UTI: "public.png",
          });
        } else {
          Toast.show({ type: "info", text1: "Descarga", text2: "Archivo guardado en: " + fileUri });
        }
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo descargar la imagen." });
      console.error(error);
    }
  };

  if (!codigoQr) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 180, delay: 150 }}
      style={styles.card}
    >
      <Text style={styles.title}>Credencial Digital</Text>
      <Text style={styles.subtitle}>
        Acceso al instituto y sus instalaciones.
      </Text>
      <Image
        source={{ uri: codigoQr }}
        style={styles.qrImage}
        contentFit="contain"
        transition={300}
      />
      <TouchableOpacity
        style={styles.downloadBtn}
        activeOpacity={0.7}
        onPress={handleDownload}
      >
        <Download size={16} color={theme.colors.text} />
        <Text style={styles.downloadText}>Descargar credencial</Text>
      </TouchableOpacity>
    </MotiView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      textAlign: "center",
    },
    qrImage: {
      width: 220,
      height: 220,
      marginBottom: 20,
    },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border + "30",
      width: "100%",
    },
    downloadText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
    },
  });
