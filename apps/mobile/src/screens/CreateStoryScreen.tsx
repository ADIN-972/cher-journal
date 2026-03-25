import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customStoriesAPI, type StoryFormData } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

const GENRES = [
  { key: 'PASSIONS_CHARNELLES', label: 'Passions Charnelles' },
  { key: 'ROMANCES_TENDRES', label: 'Romances Tendres' },
  { key: 'MYSTERIES_SENSUELS', label: 'Mysteres Sensuels' },
  { key: 'INTERDITS', label: 'Interdits' },
  { key: 'CONQUETES', label: 'Conquetes' },
  { key: 'REVES_SECRETS', label: 'Reves Secrets' },
  { key: 'PASSION_BRUTALE', label: 'Passion Brutale' },
  { key: 'AMOUR_COMPLIQUE', label: 'Amour Complique' },
  { key: 'DESIR_NOCTURNE', label: 'Desir Nocturne' },
  { key: 'LIBERATION', label: 'Liberation' },
  { key: 'DECOUVERTE_DE_SOI', label: 'Decouverte de Soi' },
  { key: 'INTIMITE_PSYCHOLOGIQUE', label: 'Intimite Psychologique' },
  { key: 'EVEIL_DU_DESIR', label: 'Eveil du Desir' },
  { key: 'RELATIONS_TRANSFORMATRICES', label: 'Relations Transformatrices' },
  { key: 'MEMOIRE_DU_CORPS', label: 'Memoire du Corps' },
];

const EXPLICIT_LEVELS = [
  { key: 'ROMANTIQUE', label: 'Romantique', desc: 'Doux et poetique' },
  { key: 'SUGGESTIF', label: 'Suggestif', desc: 'Sous-entendu elegant' },
  { key: 'SENSUEL', label: 'Sensuel', desc: 'Charnel et raffine' },
  { key: 'EXPLICITE', label: 'Explicite', desc: 'Direct et assume' },
  { key: 'TRES_EXPLICITE', label: 'Tres Explicite', desc: 'Sans retenue' },
];

const ENDINGS = [
  { key: 'HAPPY', label: 'Happy End', icon: 'favorite' },
  { key: 'BITTERSWEET', label: 'Doux-amer', icon: 'sentiment_neutral' },
  { key: 'TRAGIC', label: 'Tragique', icon: 'heart_broken' },
  { key: 'OPEN', label: 'Ouvert', icon: 'help_outline' },
];

const EMOTION_LEVELS = [
  { key: 'niveauIntensitee', label: 'Intensite', icon: 'local_fire_department', color: '#EF4444' },
  { key: 'niveauDouceur', label: 'Douceur', icon: 'favorite', color: '#EC4899' },
  { key: 'niveauDanger', label: 'Danger', icon: 'warning', color: '#F97316' },
  { key: 'niveauTransformation', label: 'Transformation', icon: 'auto_fix_high', color: '#8B5CF6' },
];

const INITIAL_FORM: StoryFormData = {
  protagonistName: '',
  photoAssetIds: [],
  description: '',
  selectedGenres: [],
  explicitLevel: 'SENSUEL',
  niveauIntensitee: 3,
  niveauDouceur: 3,
  niveauDanger: 3,
  niveauTransformation: 3,
  storyEnding: 'HAPPY',
  storyEndingCustom: '',
  volumeProposals: Array.from({ length: 10 }, (_, i) => ({
    volumeNumber: i + 1,
    proposedLocation: '',
    proposedOrientation: '',
    proposedTwist: '',
  })),
  email: '',
  rgpdConsent: false,
  ccpaConsent: false,
};

const TOTAL_STEPS = 6; // Intro + 5 form steps

export default function CreateStoryScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StoryFormData>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [expandedVolume, setExpandedVolume] = useState<number | null>(null);

  const update = <K extends keyof StoryFormData>(key: K, value: StoryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGenre = (genre: string) => {
    setForm((prev) => {
      const current = prev.selectedGenres;
      if (current.includes(genre)) {
        return { ...prev, selectedGenres: current.filter((g) => g !== genre) };
      }
      if (current.length >= 5) return prev;
      return { ...prev, selectedGenres: [...current, genre] };
    });
  };

  const updateVolume = (idx: number, field: string, value: string) => {
    setForm((prev) => {
      const vols = [...prev.volumeProposals];
      vols[idx] = { ...vols[idx], [field]: value };
      return { ...prev, volumeProposals: vols };
    });
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (step === 2 && !form.protagonistName.trim()) errors.push('Nom du protagoniste');
    if (step === 3) {
      if (!form.description.trim()) errors.push('Description');
      if (form.selectedGenres.length === 0) errors.push('Au moins un genre');
    }
    if (step === 6) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.push('Email valide');
      if (!form.rgpdConsent) errors.push('Consentement RGPD');
      if (!form.ccpaConsent) errors.push('Consentement CCPA');
    }
    return errors;
  };

  const goNext = () => {
    const errors = validate();
    if (errors.length > 0) {
      Alert.alert('Champs manquants', errors.join('\n'));
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      Alert.alert('Champs manquants', errors.join('\n'));
      return;
    }
    setSubmitting(true);
    try {
      await customStoriesAPI.createAndSubmit(form);
      router.replace('/account/my-requests');
    } catch (err: any) {
      Alert.alert('Erreur', err.userMessage || err.message || 'Erreur lors de la soumission');
      setSubmitting(false);
    }
  };

  // --- STEP RENDERERS ---

  const renderIntro = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.introHeading, { color: tc.text }]}>
        Creez votre{' '}
        <Text style={[styles.introAccent, { color: tc.gold }]}>destin</Text>
      </Text>
      <Text style={[styles.introSubheading, { color: tc.softGold }]}>Chaque secret merite d'etre ecrit...</Text>

      <Text style={[styles.introText, { color: tc.textSecondary }]}>
        L'auteur recherche sa nouvelle muse. Un portrait, une confidence, un frisson...
        pretez votre essence pour incarner l'heroine du prochain roman.
      </Text>

      <Text style={[styles.introQuestion, { color: tc.text }]}>
        Vous avez une histoire sensuelle a partager ? Une protagoniste qui vous hante ?
        Des reves secrets a explorer ?
      </Text>

      <Text style={[styles.introText, { fontWeight: '500', marginTop: spacing.lg, color: tc.textSecondary }]}>
        Proposez-nous les elements de votre histoire personnalisee :
      </Text>

      {[
        'Le nom et l\'apparence de votre protagoniste',
        'Sa personnalite, ses desirs et ses secrets',
        'L\'intensite emotionnelle de son univers',
        'Les lieux et evenements cles des 10 volumes',
        'Comment vous imaginez la fin',
      ].map((item, i) => (
        <View key={i} style={styles.introListItem}>
          <Icon name="star" size={16} color={tc.softGold} />
          <Text style={[styles.introListText, { color: tc.text }]}>{item}</Text>
        </View>
      ))}

      <View style={[styles.introNote, { backgroundColor: tc.badgeBg, borderColor: tc.badgeBorder }]}>
        <Text style={[styles.introNoteText, { color: tc.textSecondary }]}>
          Les histoires approuvees seront creees gratuitement. Vous aurez acces a votre
          histoire en bundle special et en edition imprimee.
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: tc.text }]}>Votre Protagoniste</Text>
      <Text style={[styles.stepDesc, { color: tc.textSecondary }]}>Donnez vie a votre personnage principal</Text>

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Nom du protagoniste *</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
        value={form.protagonistName}
        onChangeText={(v) => update('protagonistName', v)}
        placeholder="Ex: Sophia, Valerie..."
        placeholderTextColor={tc.placeholder}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: tc.text }]}>Personnalite</Text>
      <Text style={[styles.stepDesc, { color: tc.textSecondary }]}>Decrivez l'univers de votre histoire</Text>

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Description *</Text>
      <TextInput
        style={[styles.textInput, styles.textArea, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
        value={form.description}
        onChangeText={(v) => update('description', v)}
        placeholder="Decrivez le caractere, l'atmosphere souhaitee..."
        placeholderTextColor={tc.placeholder}
        multiline
        textAlignVertical="top"
      />

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Genres * (max 5)</Text>
      <View style={styles.genreGrid}>
        {GENRES.map((g) => {
          const selected = form.selectedGenres.includes(g.key);
          return (
            <TouchableOpacity
              key={g.key}
              style={[styles.genreChip, { backgroundColor: tc.card, borderColor: tc.cardBorder }, selected && { backgroundColor: tc.badgeBg, borderColor: tc.gold }]}
              onPress={() => toggleGenre(g.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.genreChipText, { color: tc.textSecondary }, selected && { color: tc.gold }]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Niveau d'explicite</Text>
      <View style={styles.optionsList}>
        {EXPLICIT_LEVELS.map((lvl) => {
          const selected = form.explicitLevel === lvl.key;
          return (
            <TouchableOpacity
              key={lvl.key}
              style={[styles.optionCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }, selected && { borderColor: tc.gold, backgroundColor: tc.badgeBg }]}
              onPress={() => update('explicitLevel', lvl.key as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: tc.text }, selected && { color: tc.gold }]}>
                {lvl.label}
              </Text>
              <Text style={[styles.optionDesc, { color: tc.textSecondary }, selected && { color: tc.text }]}>
                {lvl.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: tc.text }]}>Niveaux Emotionnels</Text>
      <Text style={[styles.stepDesc, { color: tc.textSecondary }]}>Dosez l'intensite de votre histoire</Text>

      {EMOTION_LEVELS.map((em) => {
        const value = form[em.key as keyof StoryFormData] as number;
        return (
          <View key={em.key} style={styles.emotionRow}>
            <View style={styles.emotionHeader}>
              <Icon name={em.icon} size={18} color={em.color} />
              <Text style={[styles.emotionLabel, { color: tc.text }]}>{em.label}</Text>
              <Text style={[styles.emotionValue, { color: em.color }]}>{value}/5</Text>
            </View>
            <View style={styles.emotionDots}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => update(em.key as keyof StoryFormData, n as any)}
                  style={[
                    styles.dot,
                    { backgroundColor: tc.separator },
                    n <= value && { backgroundColor: em.color },
                  ]}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: tc.text }]}>Structure</Text>
      <Text style={[styles.stepDesc, { color: tc.textSecondary }]}>Orientez le deroulement de votre histoire</Text>

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Fin souhaitee</Text>
      <View style={styles.endingsRow}>
        {ENDINGS.map((e) => {
          const selected = form.storyEnding === e.key;
          return (
            <TouchableOpacity
              key={e.key}
              style={[styles.endingCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }, selected && { borderColor: tc.gold, backgroundColor: tc.badgeBg }]}
              onPress={() => update('storyEnding', e.key as any)}
              activeOpacity={0.7}
            >
              <Icon name={e.icon} size={24} color={selected ? tc.gold : tc.textTertiary} />
              <Text style={[styles.endingLabel, { color: tc.textSecondary }, selected && { color: tc.gold }]}>
                {e.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        style={[styles.textInput, styles.textAreaSmall, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
        value={form.storyEndingCustom}
        onChangeText={(v) => update('storyEndingCustom', v)}
        placeholder="Precision sur la fin souhaitee (optionnel)"
        placeholderTextColor={tc.placeholder}
        multiline
        textAlignVertical="top"
      />

      <Text style={[styles.fieldLabel, { marginTop: spacing.xl, color: tc.textSecondary }]}>
        Propositions par volume (optionnel)
      </Text>
      {form.volumeProposals.map((vol, idx) => (
        <View key={idx}>
          <TouchableOpacity
            style={[styles.volumeHeader, { borderBottomColor: tc.separator }]}
            onPress={() => setExpandedVolume(expandedVolume === idx ? null : idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.volumeTitle, { color: tc.text }]}>Volume {vol.volumeNumber}</Text>
            <Icon
              name={expandedVolume === idx ? 'expand_less' : 'expand_more'}
              size={20}
              color={tc.textSecondary}
            />
          </TouchableOpacity>
          {expandedVolume === idx && (
            <View style={styles.volumeFields}>
              <TextInput
                style={[styles.volumeInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={vol.proposedLocation}
                onChangeText={(v) => updateVolume(idx, 'proposedLocation', v)}
                placeholder="Lieu / region"
                placeholderTextColor={tc.placeholder}
              />
              <TextInput
                style={[styles.volumeInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={vol.proposedOrientation}
                onChangeText={(v) => updateVolume(idx, 'proposedOrientation', v)}
                placeholder="Evenement cle"
                placeholderTextColor={tc.placeholder}
              />
              <TextInput
                style={[styles.volumeInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                value={vol.proposedTwist}
                onChangeText={(v) => updateVolume(idx, 'proposedTwist', v)}
                placeholder="Surprise / retournement"
                placeholderTextColor={tc.placeholder}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: tc.text }]}>Finalisation</Text>
      <Text style={[styles.stepDesc, { color: tc.textSecondary }]}>Verifiez et soumettez votre demande</Text>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: tc.card, borderColor: tc.badgeBorder }]}>
        <Text style={[styles.summaryTitle, { color: tc.gold }]}>Resume</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: tc.textSecondary }]}>Protagoniste</Text>
          <Text style={[styles.summaryValue, { color: tc.text }]}>{form.protagonistName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: tc.textSecondary }]}>Genres</Text>
          <Text style={[styles.summaryValue, { color: tc.text }]}>{form.selectedGenres.length} selectionne(s)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: tc.textSecondary }]}>Explicite</Text>
          <Text style={[styles.summaryValue, { color: tc.text }]}>
            {EXPLICIT_LEVELS.find((l) => l.key === form.explicitLevel)?.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: tc.textSecondary }]}>Fin</Text>
          <Text style={[styles.summaryValue, { color: tc.text }]}>
            {ENDINGS.find((e) => e.key === form.storyEnding)?.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Email *</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
        value={form.email}
        onChangeText={(v) => update('email', v)}
        placeholder="votre@email.com"
        placeholderTextColor={tc.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Consents */}
      <View style={styles.consentRow}>
        <Switch
          value={form.rgpdConsent}
          onValueChange={(v) => update('rgpdConsent', v)}
          trackColor={{ true: tc.gold, false: tc.separator }}
          thumbColor="#FFFFFF"
        />
        <Text style={[styles.consentText, { color: tc.textSecondary }]}>
          J'accepte le traitement de mes donnees personnelles conformement au RGPD *
        </Text>
      </View>

      <View style={styles.consentRow}>
        <Switch
          value={form.ccpaConsent}
          onValueChange={(v) => update('ccpaConsent', v)}
          trackColor={{ true: tc.gold, false: tc.separator }}
          thumbColor="#FFFFFF"
        />
        <Text style={[styles.consentText, { color: tc.textSecondary }]}>
          J'accepte les conditions d'utilisation et la politique de confidentialite *
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderIntro();
      case 2: return renderStep1();
      case 3: return renderStep2();
      case 4: return renderStep3();
      case 5: return renderStep4();
      case 6: return renderStep5();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: tc.background }]} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/account/my-requests')}>
            <Icon name="close" size={24} color={tc.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tc.text }]}>Nouvelle Demande</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                { backgroundColor: tc.separator },
                i + 1 <= step && { backgroundColor: tc.gold },
                i + 1 === step && styles.stepDotCurrent,
              ]}
            />
          ))}
          <Text style={[styles.stepCounter, { color: tc.textSecondary }]}>{step}/{TOTAL_STEPS}</Text>
        </View>

        {/* Current step content */}
        {renderCurrentStep()}

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.prevButton, { backgroundColor: tc.separatorLight }]}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Icon name="arrow_back" size={18} color={tc.textSecondary} />
              <Text style={[styles.prevButtonText, { color: tc.textSecondary }]}>Precedent</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < TOTAL_STEPS ? (
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: tc.rose }]} onPress={goNext} activeOpacity={0.7}>
              <Text style={styles.nextButtonText}>Suivant</Text>
              <Icon name="arrow_forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: tc.gold }, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={tc.boudoir900} />
              ) : (
                <>
                  <Icon name="send" size={18} color={tc.boudoir900} />
                  <Text style={[styles.submitButtonText, { color: tc.boudoir900 }]}>Soumettre</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.charcoal,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  stepDotActive: { backgroundColor: colors.gold },
  stepDotCurrent: { width: 24, borderRadius: 4 },
  stepCounter: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginLeft: spacing.sm,
  },

  // Step content
  stepContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  stepTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['2xl'],
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  stepDesc: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xl,
  },

  // Intro
  introHeading: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: 28,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  introAccent: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 42,
    color: colors.gold,
  },
  introSubheading: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize.xl,
    color: colors.softGold,
    marginBottom: spacing.xl,
  },
  introText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.base,
    color: colors.gray[600],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  introQuestion: {
    fontSize: fontSize.base,
    color: colors.charcoal,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  introListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  introListText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.charcoal,
    lineHeight: 20,
  },
  introNote: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: `${colors.gold}08`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.gold}20`,
  },
  introNoteText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },

  // Fields
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.charcoal,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  textAreaSmall: { minHeight: 80, textAlignVertical: 'top' },

  // Genres
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  genreChipSelected: {
    backgroundColor: `${colors.gold}15`,
    borderColor: colors.gold,
  },
  genreChipText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },
  genreChipTextSelected: {
    color: colors.gold,
    fontWeight: '600',
  },

  // Options (explicit levels)
  optionsList: { gap: spacing.sm },
  optionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  optionCardSelected: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}10`,
  },
  optionLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.charcoal },
  optionLabelSelected: { color: colors.gold },
  optionDesc: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2 },
  optionDescSelected: { color: colors.charcoal },

  // Emotions
  emotionRow: {
    marginBottom: spacing.xl,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emotionLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.charcoal,
    flex: 1,
  },
  emotionValue: { fontSize: fontSize.lg, fontWeight: '700' },
  emotionDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[200],
  },

  // Endings
  endingsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  endingCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  endingCardSelected: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}10`,
  },
  endingLabel: { fontSize: 11, color: colors.gray[500] },
  endingLabelSelected: { color: colors.gold, fontWeight: '600' },

  // Volume proposals
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  volumeTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.charcoal },
  volumeFields: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  volumeInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.charcoal,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: `${colors.gold}30`,
    padding: spacing.lg,
  },
  summaryTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: { fontSize: fontSize.sm, color: colors.gray[500] },
  summaryValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.charcoal },

  // Consents
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  consentText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.gray[600],
    lineHeight: 18,
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  prevButtonText: { fontSize: fontSize.sm, color: colors.gray[600] },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.rose,
  },
  nextButtonText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.white },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gold,
  },
  submitButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.boudoir[900],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
