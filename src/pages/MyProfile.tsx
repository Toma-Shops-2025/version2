import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Star, 
  MessageCircle, 
  Heart,
  Settings,
  Edit,
  Camera,
  Check,
  X,
  Rocket,
  Pause,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioContext } from '@/hooks/use-audio-context';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAppContext();
  const { toast } = useToast();
  const { audioContext, isPlaying, togglePlay } = useAudioContext();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalSales: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (!currentUser?.id) {
      navigate('/');
      return;
    }
    fetchProfileData();
    fetchUserStats();
  }, [currentUser, navigate]);

  const fetchProfileData = async () => {
    if (!currentUser?.id) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } else {
        setProfileData(data);
        setEditingName(data?.name || '');
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!currentUser?.id) return;

    try {
      // Get total listings
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', currentUser.id);

      // Get total sales (purchases where user is seller)
      const { count: salesCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', currentUser.id);

      // Get reviews and ratings
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', currentUser.id);

      const totalReviews = reviews?.length || 0;
      const averageRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
        : 0;

      setStats({
        totalListings: listingsCount || 0,
        totalSales: salesCount || 0,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) {
        throw updateError;
      }

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditingName(profileData?.name || '');
  };

  const handleNameSave = async () => {
    if (!currentUser?.id || !editingName.trim()) return;

    setSavingName(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editingName.trim() })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      setProfileData(prev => ({ ...prev, name: editingName.trim() }));
      setIsEditingName(false);
      toast({
        title: "Success",
        description: "Name updated successfully!",
      });
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditingName(profileData?.name || '');
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Please log in to view your profile</p>
          <Button onClick={() => navigate('/')} className="bg-yellow-400 text-black hover:bg-yellow-500">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              ← Back
            </Button>
            <h1 className="text-xl font-semibold text-white">My Profile</h1>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/account')}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-yellow-400">
              <AvatarImage src={profileData?.avatar_url} />
              <AvatarFallback className="text-3xl bg-gray-700 text-yellow-400 border-4 border-yellow-400">
                <Rocket className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="absolute bottom-0 right-0 bg-yellow-400 text-black hover:bg-yellow-500 rounded-full p-2 shadow-lg"
              size="sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
          
          <div className="mt-4">
            <div className="text-2xl font-bold text-white mb-2">
              {currentUser.email}
            </div>
            <div className="text-lg text-gray-400 mb-1">
              {currentUser.email}
            </div>
            <div className="text-sm text-gray-500">
              User ID: {currentUser.id}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalListings}</div>
              <div className="text-sm text-gray-400">Listings</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalSales}</div>
              <div className="text-sm text-gray-400">Sales</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalReviews}</div>
              <div className="text-sm text-gray-400">Reviews</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.averageRating}</div>
              <div className="text-sm text-gray-400">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Settings className="h-5 w-5 text-yellow-400" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/sell')}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                <Edit className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
              <Button 
                onClick={() => navigate('/my-listings')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <User className="h-4 w-4 mr-2" />
                My Listings
              </Button>
              <Button 
                onClick={() => navigate('/my-orders')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                My Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Heart className="h-5 w-5 text-red-400" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Profile updated</span>
                </div>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">New listing created</span>
                </div>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Received a review</span>
                </div>
                <span className="text-xs text-gray-500">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile; 