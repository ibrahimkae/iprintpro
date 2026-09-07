import React, { useState } from 'react';
import { CommunityTemplate, ThermalTemplate, LabelCategory } from '../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  X, 
  Share2, 
  Sparkles, 
  User, 
  Tag, 
  FileText, 
  Smile, 
  Layers
} from 'lucide-react';

interface ShareCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (newPost: CommunityTemplate) => void;
  availableTemplates: ThermalTemplate[];
}

const AVATAR_OPTIONS = ['🎨', '🌸', '☕', '🏷️', '📦', '⚡', '🕯️', '🌿', '👨‍🍳', '👾', '📖', '💼'];

export const ShareCommunityModal: React.FC<ShareCommunityModalProps> = ({
  isOpen,
  onClose,
  onShare,
  availableTemplates
}) => {
  // Load saved user handle from localStorage if available
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('iprint_community_username') || 'tasarimci_' + Math.floor(100 + Math.random() * 900);
  });
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('iprint_community_display_name') || 'Termal Tasarım';
  });
  const [avatar, setAvatar] = useState('🎨');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('butik, etiket, el yapımı');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    availableTemplates[0]?.id || ''
  );
  const [category, setCategory] = useState<LabelCategory>('product');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remember user handle for next time
    try {
      localStorage.setItem('iprint_community_username', username.replace(/^@/, ''));
      localStorage.setItem('iprint_community_display_name', displayName);
    } catch {}

    const baseTpl = availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0];

    const cleanTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newPost: CommunityTemplate = {
      id: `community-post-${Date.now()}`,
      author: {
        username: username.replace(/^@/, '').trim() || 'kullanici',
        displayName: displayName.trim() || 'Tasarım Sever',
        avatar: avatar,
        badge: 'Topluluk',
        verified: false
      },
      likesCount: 1,
      printCount: 0,
      tags: cleanTags.length > 0 ? cleanTags : ['özel', 'şablon'],
      createdAt: Date.now(),
      caption: caption.trim(),
      paperStyle: 'standard',
      template: {
        ...baseTpl,
        id: `comm-tpl-${Date.now()}`,
        title: title.trim() || baseTpl.title,
        category: category,
        isCustom: true
      }
    };

    onShare(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Share2 size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-none">
                Tasarımını Keşfet'te Paylaş
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Topluluk akışına şablonunu ekle, diğer kullanıcılar ilham alsın
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Author Profile Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <Label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Profil Bilgilerin
            </Label>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Kullanıcı Adı</span>
                <div className="relative mt-0.5">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">@</span>
                  <Input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kullanici_adi"
                    className="h-8 pl-6 text-xs rounded-xl font-bold bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-medium">Görünen İsim</span>
                <Input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ahmet Tasarım"
                  className="h-8 text-xs rounded-xl font-bold bg-white dark:bg-slate-900 mt-0.5"
                />
              </div>
            </div>

            {/* Avatar Select */}
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Avatar Emojisi</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {AVATAR_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatar(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      avatar === em
                        ? 'bg-purple-600 text-white shadow-xs scale-110'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} /> Paylaşılacak Tasarım / Şablon
            </Label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                const found = availableTemplates.find((t) => t.id === e.target.value);
                if (found && !title) setTitle(found.title);
              }}
              className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200"
            >
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.recommendedWidthMm || 57}mm)
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} /> Paylaşım Başlığı
            </Label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Butik Kargo Teşekkür & İndirim Kartı"
              className="h-9 text-xs rounded-xl font-bold"
            />
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} /> Açıklama & Not (İsteğe Bağlı)
            </Label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Bu tasarımı ne amaçla kullanıyorsunuz? Hangi rulo ile en iyi sonucu veriyor?"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={12} /> Etiketler (Virgülle ayırın)
            </Label>
            <Input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="butik, etiket, kargo, hediye"
              className="h-8 text-xs rounded-xl font-medium"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Share2 size={15} />
              <span>Keşfet Akışında Yayınla</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
