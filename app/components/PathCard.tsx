interface PathCardProps {
    name: string;
    variant?: 'neon' | 'laboratory' | 'modern' | 'floating' | 'gradient-3d' | 'minimal-dark' | 'glassmorphism' | 'neon-glow' | 'carbon' | 'crystal';
}

export default function PathCard({ name, variant = 'modern' }: PathCardProps) {
    // Option 1: Modern (Clean & Contemporary)
    const ModernButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-gradient-to-r from-slate-100 via-white to-slate-50
                border border-slate-200 rounded-2xl
                shadow-sm shadow-slate-200/50
                hover:shadow-xl hover:shadow-indigo-400/40
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                hover:border-indigo-300
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-600/6
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-slate-700 font-medium text-base tracking-wide select-none
                    group-hover:text-slate-900 transition-colors duration-300
                ">
                    {name}
                </div>
            </div>
            
            {/* Blue to purple glow behind button */}
            <div className="
                absolute -inset-1 bg-gradient-to-r from-blue-500/35 via-indigo-500/25 to-purple-600/15
                rounded-2xl blur-sm opacity-0 group-hover:opacity-100
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Option 2: Floating (Elevated & Clean)
    const FloatingButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-white border border-slate-200 rounded-2xl
                shadow-lg shadow-slate-200/50
                hover:shadow-2xl hover:shadow-slate-300/50
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-2
                cursor-pointer overflow-hidden
                hover:border-blue-200
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-slate-600 font-medium text-base tracking-wide select-none
                    group-hover:text-slate-800 transition-colors duration-300
                ">
                    {name}
                </div>
            </div>
        </div>
    );

    // Option 3: Neon (Glowing Border Effect)
    const NeonButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-black/80 border-2 border-blue-400 rounded-xl
                shadow-lg shadow-blue-400/50
                hover:shadow-xl hover:shadow-blue-400/80
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                group-hover:border-blue-300
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-blue-400 font-bold text-lg tracking-wider select-none
                    group-hover:text-blue-300 transition-colors duration-300
                ">
                    {name}
                </div>
            </div>
            <div className="
                absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600
                rounded-xl blur-sm opacity-0 group-hover:opacity-40
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Option 4: Gradient 3D (Modern 3D Effect)
    const Gradient3DButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700
                border border-blue-400/30 rounded-2xl
                shadow-lg shadow-blue-500/30
                hover:shadow-xl hover:shadow-blue-500/50
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
                before:rounded-2xl before:opacity-0 before:group-hover:opacity-100
                before:transition-opacity before:duration-300
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700 ease-out
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-white font-semibold text-base tracking-wide select-none
                    drop-shadow-sm
                ">
                    {name}
                </div>
            </div>
        </div>
    );

    // Option 5: Minimal Dark (Clean Dark Theme)
    const MinimalDarkButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-slate-800 border border-slate-600 rounded-xl
                shadow-lg shadow-slate-900/50
                hover:shadow-xl hover:shadow-slate-900/70
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                hover:border-blue-400/50
            ">
                {/* Prominent blue left border on hover */}
                <div className="
                    absolute left-0 top-0 bottom-0 w-1
                    bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    shadow-sm shadow-blue-400/50
                "></div>
                
                {/* Blue glow effect on hover */}
                <div className="
                    absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                
                {/* Blue corner accent */}
                <div className="
                    absolute top-2 right-2 w-3 h-3
                    bg-gradient-to-br from-blue-400 to-blue-600
                    rounded-full opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    shadow-sm shadow-blue-400/50
                "></div>
                
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-slate-200 font-medium text-base tracking-wide select-none
                    group-hover:text-slate-100 transition-colors duration-300
                ">
                    {name}
                </div>
                
                {/* Blue accent line at bottom */}
                <div className="
                    absolute bottom-0 left-0 right-0 h-0.5
                    bg-gradient-to-r from-transparent via-blue-500/40 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100
                "></div>
            </div>
            
            {/* Enhanced blue glow behind button */}
            <div className="
                absolute -inset-2 bg-gradient-to-r from-blue-400/40 to-blue-600/40
                rounded-xl blur-md opacity-0 group-hover:opacity-100
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Option 6: Glassmorphism (Frosted Glass)
    const GlassmorphismButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-white/10 backdrop-blur-md
                border border-white/20 rounded-2xl
                shadow-lg shadow-slate-500/20
                hover:shadow-xl hover:shadow-slate-500/30
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-white font-medium text-base tracking-wide select-none
                    drop-shadow-lg
                ">
                    {name}
                </div>
            </div>
            <div className="
                absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500
                rounded-2xl blur-md opacity-0 group-hover:opacity-20
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Option 7: Neon Glow (Enhanced Neon)
    const NeonGlowButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-black/90 border-2 border-cyan-400 rounded-xl
                shadow-lg shadow-cyan-400/50
                hover:shadow-xl hover:shadow-cyan-400/80
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                group-hover:border-cyan-300
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-cyan-400 font-bold text-base tracking-wider select-none
                    group-hover:text-cyan-300 transition-colors duration-300
                ">
                    {name}
                </div>
            </div>
            <div className="
                absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500
                rounded-xl blur-sm opacity-0 group-hover:opacity-50
                transition-opacity duration-300 -z-10
                animate-pulse
            "></div>
        </div>
    );

    // Option 8: Carbon (Industrial Look)
    const CarbonButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800
                border border-slate-600 rounded-lg
                shadow-lg shadow-slate-900/50
                hover:shadow-xl hover:shadow-slate-900/70
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                before:absolute before:top-0 before:left-0 before:right-0 before:h-px
                before:bg-gradient-to-r before:from-transparent before:via-slate-400 before:to-transparent
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-slate-200 font-medium text-base tracking-wide select-none
                    group-hover:text-white transition-colors duration-300
                ">
                    {name}
                </div>
            </div>
        </div>
    );

    // Option 9: Crystal (Transparent & Shiny)
    const CrystalButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-white/20 backdrop-blur-sm
                border border-white/30 rounded-2xl
                shadow-lg shadow-slate-500/20
                hover:shadow-xl hover:shadow-slate-500/30
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
            ">
                <div className="
                    absolute inset-0 bg-gradient-to-br from-white/10 to-transparent
                "></div>
                <div className="
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-transform duration-1000 ease-out
                "></div>
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-white font-medium text-base tracking-wide select-none
                    drop-shadow-lg
                ">
            {name}
                </div>
            </div>
            <div className="
                absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent
                rounded-2xl blur-sm opacity-0 group-hover:opacity-100
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Option 10: Laboratory (Scientific Theme)
    const LaboratoryButton = () => (
        <div className="relative group">
            <div className="
                relative w-80 h-15
                bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700
                border-2 border-slate-400 rounded-lg
                shadow-lg shadow-slate-500/30
                hover:shadow-xl hover:shadow-slate-500/50
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                cursor-pointer overflow-hidden
                before:absolute before:top-0 before:left-0 before:w-full before:h-1
                before:bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400
                before:opacity-0 before:group-hover:opacity-100
                before:transition-opacity before:duration-300
            ">
                {/* Test tube bubbles effect */}
                <div className="
                    absolute top-2 left-4 w-2 h-2 bg-cyan-300 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    animate-bounce
                "></div>
                <div className="
                    absolute top-4 right-6 w-1.5 h-1.5 bg-blue-300 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200
                    animate-bounce
                "></div>
                <div className="
                    absolute bottom-3 left-1/3 w-1 h-1 bg-cyan-200 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400
                    animate-bounce
                "></div>
                
                {/* Scientific grid pattern */}
                <div className="
                    absolute inset-0 opacity-5
                    bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.1)_50%),linear-gradient(0deg,transparent_50%,rgba(255,255,255,0.1)_50%)]
                    bg-[length:8px_8px]
                "></div>
                
                {/* Shimmer effect */}
                <div className="
                    absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                    -translate-x-full group-hover:translate-x-full
                    transition-transform duration-700 ease-out
                "></div>
                
                {/* Content with scientific styling */}
                <div className="
                    relative z-10 h-full flex items-center justify-center px-6
                    text-slate-100 font-mono font-semibold text-sm tracking-wider select-none
                    group-hover:text-white transition-colors duration-300
                ">
                    <span className="mr-2 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                        ⚗️
                    </span>
                    {name.toUpperCase()}
                </div>
                
                {/* Bottom accent line */}
                <div className="
                    absolute bottom-0 left-0 right-0 h-0.5
                    bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                "></div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="
                absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500
                rounded-lg blur-sm opacity-0 group-hover:opacity-20
                transition-opacity duration-300 -z-10
            "></div>
        </div>
    );

    // Render the selected variant
    switch (variant) {
        case 'floating':
            return <FloatingButton />;
        case 'neon':
            return <NeonButton />;
        case 'gradient-3d':
            return <Gradient3DButton />;
        case 'minimal-dark':
            return <MinimalDarkButton />;
        case 'glassmorphism':
            return <GlassmorphismButton />;
        case 'neon-glow':
            return <NeonGlowButton />;
        case 'carbon':
            return <CarbonButton />;
        case 'crystal':
            return <CrystalButton />;
        case 'laboratory':
            return <LaboratoryButton />;
        default:
            return <ModernButton />;
    }
}