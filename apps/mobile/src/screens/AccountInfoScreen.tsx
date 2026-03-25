import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from '@/components/Icon';
import ScreenHeader from '@/components/ScreenHeader';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api/client';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

export default function AccountInfoScreen() {
  const tc = useThemeColors();
  const { user, updateUser, logout } = useAuthStore();
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user?.id, user?.firstName, user?.lastName, user?.email]);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handlePersonalInfoSave = async () => {
    const firstName = personalInfo.firstName.trim();
    const lastName = personalInfo.lastName.trim();
    if (!firstName || !lastName) {
      Alert.alert('Erreur', 'Le prenom et le nom sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/me/profile', { firstName, lastName });
      const updatedUser = res.data?.data?.user || res.data?.user;
      if (updatedUser) {
        await updateUser({ firstName: updatedUser.firstName, lastName: updatedUser.lastName });
      }
      Alert.alert('Succes', 'Vos informations ont ete mises a jour.');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Impossible de mettre a jour vos informations.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwords.new.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/me/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      Alert.alert('Succes', 'Votre mot de passe a ete modifie.');
      setIsEditingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      let msg = err.response?.data?.error?.message || err.message || 'Erreur lors du changement de mot de passe.';
      if (code === 'INVALID_CURRENT_PASSWORD') {
        msg = 'Le mot de passe actuel est incorrect.';
      }
      Alert.alert('Erreur', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe pour confirmer.');
      return;
    }
    setDeleting(true);
    try {
      await api.post('/me/delete-account', { password: deletePassword });
      Alert.alert('Compte supprime', 'Votre compte a ete supprime avec succes.', [
        { text: 'OK', onPress: () => logout() },
      ]);
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      let msg = err.response?.data?.error?.message || err.message || 'Erreur lors de la suppression.';
      if (code === 'INVALID_PASSWORD') {
        msg = 'Mot de passe incorrect.';
      }
      Alert.alert('Erreur', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Mon Compte" subtitle="Informations personnelles et securite" />

      {/* Personal Info Section */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Icon name="person" size={24} color={tc.gold} />
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Informations Personnelles</Text>
          </View>

          <Text style={[styles.label, { color: tc.text }]}>Prenom</Text>
          <TextInput
            style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
            value={personalInfo.firstName}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, firstName: text })}
            placeholder="Votre prenom"
            placeholderTextColor={tc.placeholder}
          />

          <Text style={[styles.label, { color: tc.text }]}>Nom</Text>
          <TextInput
            style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
            value={personalInfo.lastName}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, lastName: text })}
            placeholder="Votre nom"
            placeholderTextColor={tc.placeholder}
          />

          <Text style={[styles.label, { color: tc.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.textSecondary, opacity: 0.7 }]}
            value={personalInfo.email}
            editable={false}
            placeholder="votre@email.com"
            placeholderTextColor={tc.placeholder}
          />

          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.6 }]}
            onPress={handlePersonalInfoSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Mise a jour...' : 'Mettre a jour'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Icon name="lock" size={24} color={tc.gold} />
            <Text style={[styles.sectionTitle, { color: tc.text }]}>Securite</Text>
          </View>

          {isEditingPassword ? (
            <>
              <Text style={[styles.label, { color: tc.text }]}>Mot de passe actuel</Text>
              <TextInput
                style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={passwords.current}
                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                placeholder="Mot de passe actuel"
                placeholderTextColor={tc.placeholder}
                secureTextEntry
              />

              <Text style={[styles.label, { color: tc.text }]}>Nouveau mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={passwords.new}
                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                placeholder="Nouveau mot de passe"
                placeholderTextColor={tc.placeholder}
                secureTextEntry
              />

              <Text style={[styles.label, { color: tc.text }]}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={tc.placeholder}
                secureTextEntry
              />

              <View style={styles.passwordActions}>
                <TouchableOpacity
                  style={[styles.primaryButton, changingPassword && { opacity: 0.6 }]}
                  onPress={handlePasswordChange}
                  disabled={changingPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>{changingPassword ? 'En cours...' : 'Confirmer'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: tc.buttonSecondaryBg }]}
                  onPress={() => {
                    setIsEditingPassword(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.passwordRow}>
              <View style={styles.passwordInfo}>
                <Icon name="lock" size={20} color={tc.textSecondary} />
                <Text style={[styles.passwordText, { color: tc.textSecondary }]}>Mot de passe protege</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingPassword(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.changePasswordLink, { color: tc.gold }]}>Changer le mot de passe</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <View style={styles.dangerCard}>
          <View style={styles.dangerHeader}>
            <Icon name="warning" size={24} color={colors.error} />
            <View style={styles.dangerTextBlock}>
              <Text style={styles.dangerTitle}>Zone de danger</Text>
              <Text style={styles.dangerDescription}>
                La suppression de votre compte est definitive et irreversible. Toutes vos donnees seront perdues.
              </Text>
            </View>
          </View>

          {showDeleteConfirm ? (
            <>
              <Text style={[styles.label, { color: '#991B1B', marginTop: spacing.md }]}>
                Entrez votre mot de passe pour confirmer
              </Text>
              <TextInput
                style={[styles.input, { borderColor: 'rgba(220,38,38,0.4)' }]}
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.gray[400]}
                secureTextEntry
                autoFocus
              />
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[styles.dangerButton, { flex: 1 }, deleting && { opacity: 0.6 }]}
                  onPress={confirmDeleteAccount}
                  disabled={deleting}
                  activeOpacity={0.8}
                >
                  <Icon name="delete_forever" size={18} color={colors.white} />
                  <Text style={styles.dangerButtonText}>
                    {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelDeleteText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Icon name="delete_forever" size={18} color={colors.white} />
              <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
  },
  label: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fs.base,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryButtonText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
  },
  passwordActions: {
    marginTop: spacing.lg,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  passwordText: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },
  changePasswordLink: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.gold,
  },
  dangerCard: {
    backgroundColor: 'rgba(220,38,38,0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.25)',
    padding: spacing.xl,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dangerTextBlock: {
    flex: 1,
  },
  dangerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: '#991B1B',
    marginBottom: spacing.sm,
  },
  dangerDescription: {
    fontSize: fs.sm,
    color: '#991B1B',
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  dangerButtonText: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: colors.white,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDeleteText: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.charcoal,
  },
});
