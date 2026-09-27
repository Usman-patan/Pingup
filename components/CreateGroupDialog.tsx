"use client";

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function CreateGroupDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Id<"users">[]>([]);

    const users = useQuery(api.users.search, { query: search });
    const createGroup = useMutation(api.conversations.createGroup);
    const router = useRouter();

    const handleCreate = async () => {
        if (!name || selected.length === 0) return;
        const conversationId = await createGroup({ name, memberIds: selected });
        setOpen(false);
        setSelected([]);
        setName("");
        setSearch("");
        router.push(`/conversations/${conversationId}`);
    };

    const toggleSelect = (userId: Id<"users">) => {
        setSelected((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const selectedUsers = users?.filter((u) => selected.includes(u._id)) ?? [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="New Group" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                    <Users className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg">New Group</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Group name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />

                    {/* Selected members chips */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((u) => (
                                <span
                                    key={u._id}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/50"
                                >
                                    {u.name}
                                    <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => toggleSelect(u._id)} />
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-border pt-3">
                        <Input
                            placeholder="Search users by exact email to add..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mb-3"
                        />
                        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                            {users?.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between gap-3 p-3 hover:bg-secondary/30 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => toggleSelect(user._id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-border/30">
                                            <AvatarImage src={user.imageUrl} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                                {user.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm text-foreground">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                    {selected.includes(user._id) && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={!name || selected.length === 0}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Create Group ({selected.length} member{selected.length !== 1 ? "s" : ""})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
