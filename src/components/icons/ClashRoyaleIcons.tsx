
import { Crown, Shield, Swords, Gem, ShieldCheck, ShieldX, UserCircle, Phone, MessageSquare, Coins, Image as ImageIcon, LogIn, UserPlus, PlayCircle, Landmark, Bot, Info, ScrollText, LogOut, User } from 'lucide-react'; // Added User

// For specific icons, consider creating actual SVG components if lucide doesn't fit the cartoon style.
// For now, we map generic concepts to Lucide icons.

export const CrownIcon = (props: React.ComponentProps<typeof Crown>) => <Crown {...props} />;
export const ShieldIcon = (props: React.ComponentProps<typeof Shield>) => <Shield {...props} />; // Could be player avatar frame
export const SwordsIcon = (props: React.ComponentProps<typeof Swords>) => <Swords {...props} />; // Represents a match/duel
export const ChestIcon = (props: React.ComponentProps<typeof Gem>) => <Gem {...props} />; // Represents a reward or bet item
export const VictoryIcon = (props: React.ComponentProps<typeof ShieldCheck>) => <ShieldCheck {...props} className="text-green-500" />;
export const DefeatIcon = (props: React.ComponentProps<typeof ShieldX>) => <ShieldX {...props} className="text-destructive" />;
export const AvatarIcon = (props: React.ComponentProps<typeof UserCircle>) => <UserCircle {...props} />;
export const PhoneIcon = (props: React.ComponentProps<typeof Phone>) => <Phone {...props} />;
export const ChatIcon = (props: React.ComponentProps<typeof MessageSquare>) => <MessageSquare {...props} />;
export const SaldoIcon = (props: React.ComponentProps<typeof Coins>) => <Coins {...props} />;
export const ScreenshotIcon = (props: React.ComponentProps<typeof ImageIcon>) => <ImageIcon {...props} />;
export const LoginIcon = (props: React.ComponentProps<typeof LogIn>) => <LogIn {...props} />;
export const RegisterIcon = (props: React.ComponentProps<typeof UserPlus>) => <UserPlus {...props} />;
export const FindMatchIcon = (props: React.ComponentProps<typeof PlayCircle>) => <PlayCircle {...props} />;
export const NequiIcon = (props: React.ComponentProps<typeof Landmark>) => <Landmark {...props} />; // Generic bank/payment icon for Nequi
export const BotIcon = (props: React.ComponentProps<typeof Bot>) => <Bot {...props} />;
export const InfoIcon = (props: React.ComponentProps<typeof Info>) => <Info {...props} />;
export const ScrollTextIcon = (props: React.ComponentProps<typeof ScrollText>) => <ScrollText {...props} />;
export const LogOutIcon = (props: React.ComponentProps<typeof LogOut>) => <LogOut {...props} />;
export const UserIcon = (props: React.ComponentProps<typeof User>) => <User {...props} />; // For general User/Username fields
