'use client'

import { useState, useEffect } from 'react'
import { auth, provider, db, signInWithPopup, signOut, collection, addDoc, onSnapshot } from './config/firebase_config'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Users, Send, List } from 'lucide-react'

export default function Component() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([{ id: 'group1', name: 'All Users' }])
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'announcement', sharedWith: [] })

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    const unsubscribeAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const fetchedAnnouncements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(fetchedAnnouncements);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAnnouncements();
    }
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  const handleCreateGroup = () => {
    const groupName = prompt('Enter group name:')
    if (groupName) {
      setGroups([...groups, { id: `group${groups.length + 1}`, name: groupName }])
    }
  }

  const handlePostAnnouncement = async () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      try {
        await addDoc(collection(db, 'announcements'), {
          ...newAnnouncement,
          createdBy: user.uid,
          createdAt: new Date(),
        });
        setNewAnnouncement({ title: '', content: '', type: 'announcement', sharedWith: [] });
      } catch (error) {
        console.error("Error posting announcement: ", error);
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Button onClick={handleLogin}>Login with Google</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcement App</h1>
        <div className="flex items-center gap-4">
          <span>{user.displayName}</span>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Announcement content"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAnnouncement.type}
                  onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="todo">To-Do</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Share with</Label>
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={group.id}
                        checked={newAnnouncement.sharedWith.includes(group.id)}
                        onCheckedChange={(checked) => {
                          const updatedSharedWith = checked
                            ? [...newAnnouncement.sharedWith, group.id]
                            : newAnnouncement.sharedWith.filter((id) => id !== group.id)
                          setNewAnnouncement({ ...newAnnouncement, sharedWith: updatedSharedWith })
                        }}
                      />
                      <Label htmlFor={group.id}>{group.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handlePostAnnouncement} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements & To-Dos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <CardTitle>{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{announcement.content}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      {announcement.type === 'todo' ? (
                        <List className="w-4 h-4 mr-1" />
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      <span>{announcement.type === 'todo' ? 'To-Do' : 'Announcement'}</span>
                      <Users className="w-4 h-4 ml-4 mr-1" />
                      <span>{announcement.sharedWith.includes('all') ? 'All Users' : 'Selected Users'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleCreateGroup} className="mt-6">
        <Users className="w-4 h-4 mr-2" />
        Create New Group
      </Button>
    </div>
  )
}
