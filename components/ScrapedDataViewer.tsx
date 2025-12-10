/**
 * ScrapedDataViewer - Visualizador de dados extraídos do Instagram/APIs
 * 
 * Mostra ao usuário:
 * - Posts coletados do Instagram
 * - Detalhes do perfil
 * - Hashtags encontradas
 * - Imagens analisadas
 * - Dados brutos da API
 */

import React, { useState } from 'react';
import { 
  X, 
  Instagram, 
  Heart, 
  MessageCircle, 
  Hash, 
  User,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  Eye,
  FileJson,
  Grid,
  List
} from 'lucide-react';
import { InstagramPost, InstagramProfile } from '../types/research';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile?: InstagramProfile | null;
  posts: InstagramPost[];
  hashtags?: string[];
  rawData?: any;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (timestamp?: string): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const ScrapedDataViewer: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  posts,
  hashtags = [],
  rawData,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'profile' | 'hashtags' | 'raw'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  if (!isOpen) return null;

  // Extrair todas as hashtags dos posts
  const allHashtags = hashtags.length > 0 
    ? hashtags 
    : Array.from(new Set(posts.flatMap(p => p.hashtags || [])));
  
  // Contar frequência de hashtags
  const hashtagCounts: Record<string, number> = {};
  posts.forEach(post => {
    (post.hashtags || []).forEach(tag => {
      const cleanTag = tag.replace('#', '').toLowerCase();
      hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
    });
  });
  const sortedHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  // Calcular métricas dos posts
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const avgEngagement = posts.length > 0 
    ? Math.round((totalLikes + totalComments) / posts.length)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Instagram size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Dados Extraídos do Instagram</h2>
              <p className="text-xs text-slate-500">
                {posts.length} posts coletados • {allHashtags.length} hashtags encontradas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{posts.length}</p>
            <p className="text-xs text-slate-500">Posts Coletados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{formatNumber(totalLikes)}</p>
            <p className="text-xs text-slate-500">Total de Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatNumber(totalComments)}</p>
            <p className="text-xs text-slate-500">Total de Comentários</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{formatNumber(avgEngagement)}</p>
            <p className="text-xs text-slate-500">Eng. Médio/Post</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-200">
          {[
            { id: 'posts', label: 'Posts', icon: <Grid size={14} />, count: posts.length },
            { id: 'profile', label: 'Perfil', icon: <User size={14} /> },
            { id: 'hashtags', label: 'Hashtags', icon: <Hash size={14} />, count: allHashtags.length },
            { id: 'raw', label: 'Dados Brutos', icon: <FileJson size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {activeTab === 'posts' && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                <List size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <ImageIcon size={48} className="mb-3" />
                  <p>Nenhum post coletado ainda</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {posts.map((post, idx) => (
                    <div
                      key={post.id || idx}
                      onClick={() => setSelectedPost(post)}
                      className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer group"
                    >
                      {post.mediaUrl ? (
                        <img 
                          src={post.mediaUrl} 
                          alt={post.caption?.slice(0, 50) || 'Post'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12">Sem imagem</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} className="text-slate-300" />
                        </div>
                      )}
                      
                      {/* Overlay com métricas */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm">
                        <span className="flex items-center gap-1">
                          <Heart size={14} fill="white" />
                          {formatNumber(post.likesCount || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {formatNumber(post.commentsCount || 0)}
                        </span>
                      </div>

                      {/* Badge de tipo */}
                      {post.mediaType && post.mediaType !== 'image' && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded">
                          {post.mediaType === 'video' ? '🎬 Video' : '📷 Carousel'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post, idx) => (
                    <div
                      key={post.id || idx}
                      onClick={() => setSelectedPost(post)}
                      className="flex gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {post.mediaUrl ? (
                          <img 
                            src={post.mediaUrl} 
                            alt="Post"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-2">
                          {post.caption || <span className="text-slate-400 italic">Sem legenda</span>}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart size={12} className="text-pink-500" />
                            {formatNumber(post.likesCount || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} className="text-blue-500" />
                            {formatNumber(post.commentsCount || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.timestamp)}
                          </span>
                        </div>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.hashtags.slice(0, 5).map((tag, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">
                                #{tag.replace('#', '')}
                              </span>
                            ))}
                            {post.hashtags.length > 5 && (
                              <span className="text-[10px] text-slate-400">
                                +{post.hashtags.length - 5} mais
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto">
              {profile ? (
                <div className="bg-slate-50 rounded-xl p-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-6">
                    {profile.profilePicUrl ? (
                      <img 
                        src={profile.profilePicUrl} 
                        alt={profile.username}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <User size={32} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {profile.fullName || profile.username}
                        {profile.isVerified && <span className="ml-1 text-blue-500">✓</span>}
                      </h3>
                      <p className="text-slate-500">@{profile.username}</p>
                      {profile.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          {profile.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xl font-bold text-slate-800">
                        {formatNumber(profile.postsCount || 0)}
                      </p>
                      <p className="text-xs text-slate-500">Posts</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xl font-bold text-slate-800">
                        {formatNumber(profile.followersCount || 0)}
                      </p>
                      <p className="text-xs text-slate-500">Seguidores</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xl font-bold text-slate-800">
                        {formatNumber(profile.followingCount || 0)}
                      </p>
                      <p className="text-xs text-slate-500">Seguindo</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Bio</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                  )}

                  {/* Website */}
                  {profile.website && (
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                    >
                      <ExternalLink size={14} />
                      {profile.website}
                    </a>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.isBusinessAccount && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        💼 Conta Business
                      </span>
                    )}
                    {profile.isVerified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        ✓ Verificado
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <User size={48} className="mb-3" />
                  <p>Nenhum perfil coletado</p>
                </div>
              )}
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === 'hashtags' && (
            <div>
              {sortedHashtags.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Hash size={48} className="mb-3" />
                  <p>Nenhuma hashtag encontrada</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Hashtags mais usadas nos posts coletados (ordenado por frequência)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sortedHashtags.map(([tag, count], idx) => {
                      // Tamanho baseado na frequência
                      const maxCount = sortedHashtags[0][1];
                      const size = Math.max(0.7, Math.min(1.3, 0.7 + (count / maxCount) * 0.6));
                      
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full transition-colors cursor-default"
                          style={{ fontSize: `${size}rem` }}
                        >
                          <Hash size={14} />
                          {tag}
                          <span className="ml-1 px-1.5 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] rounded-full font-medium">
                            {count}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Raw Data Tab */}
          {activeTab === 'raw' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">
                  Dados brutos retornados pela API (JSON)
                </p>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(rawData || { profile, posts }, null, 2);
                    navigator.clipboard.writeText(dataStr);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                >
                  📋 Copiar JSON
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-auto max-h-[500px] font-mono">
                {JSON.stringify(rawData || { profile, posts }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Detalhes do Post</h3>
                <button onClick={() => setSelectedPost(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-4">
                {selectedPost.mediaUrl && (
                  <img 
                    src={selectedPost.mediaUrl}
                    alt="Post"
                    className="w-full max-h-96 object-contain bg-slate-100 rounded-lg mb-4"
                  />
                )}
                
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1 text-pink-600">
                    <Heart size={16} fill="currentColor" />
                    {formatNumber(selectedPost.likesCount || 0)} likes
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <MessageCircle size={16} />
                    {formatNumber(selectedPost.commentsCount || 0)} comentários
                  </span>
                  {selectedPost.timestamp && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={16} />
                      {formatDate(selectedPost.timestamp)}
                    </span>
                  )}
                </div>
                
                {selectedPost.caption && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4">
                    {selectedPost.caption}
                  </p>
                )}
                
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedPost.hashtags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        #{tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
