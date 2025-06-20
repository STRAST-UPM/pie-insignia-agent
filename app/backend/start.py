"""
Unified startup script for the ISST AI Tutor backend.
Includes configuration verification and server startup.
"""

import sys
import os
from pathlib import Path


def check_env_file(verbose: bool = False) -> bool:
    """Check if .env file exists and configuration loads successfully."""
    env_file = Path(".env")
    if not env_file.exists():
        if verbose:
            print("❌ .env file not found")
        return False
    
    try:
        # Test if configuration loads successfully (includes all validations)
        from config import get_settings
        get_settings()
        
        if verbose:
            print("✅ .env file found and configuration valid")
        return True
    except Exception as e:
        if verbose:
            print(f"❌ Configuration error: {e}")
        return False


def check_openai_config(verbose: bool = False) -> bool:
    """Verify OpenAI configuration using config validation."""
    try:
        from config import get_settings
        settings = get_settings()
        
        if verbose:
            api_key = settings.openai_api_key
            print(f"✅ OPENAI_API_KEY: {api_key[:10]}...{api_key[-4:]}")
            
            # Test OpenAI connection only in verbose mode
            try:
                import openai
                client = openai.OpenAI(api_key=api_key)
                models = client.models.list()
                print("✅ OpenAI API connection successful")
            except Exception as e:
                print(f"❌ OpenAI API connection failed: {e}")
                return False
        
        return True
    except Exception as e:
        if verbose:
            print(f"❌ OpenAI configuration invalid: {e}")
        return False


def check_vector_store(verbose: bool = False) -> bool:
    """Verify Vector Store configuration using config validation."""
    try:
        from config import get_settings
        settings = get_settings()
        
        if verbose:
            print(f"✅ VECTOR_STORE_ID: {settings.vector_store_id}")
            
            # Test vector store access only in verbose mode
            try:
                import openai
                client = openai.OpenAI(api_key=settings.openai_api_key)
                vector_store = client.vector_stores.retrieve(settings.vector_store_id)
                print(f"✅ Vector Store accessible: {vector_store.name}")
            except Exception as e:
                print(f"❌ Vector Store access failed: {e}")
                return False
        
        return True
    except Exception as e:
        if verbose:
            print(f"❌ Vector Store configuration invalid: {e}")
        return False


def check_supabase_config(verbose: bool = False) -> bool:
    """Verify Supabase configuration using config validation."""
    try:
        from config import get_settings
        settings = get_settings()
        
        if verbose:
            print(f"✅ SUPABASE_URL: {settings.supabase_url}")
            print(f"✅ SUPABASE_SERVICE_ROLE_KEY: {settings.supabase_service_role_key[:20]}...")
            
            # Test Supabase connection only in verbose mode
            try:
                from supabase import create_client
                supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
                result = supabase.table("chat_logs").select("*").limit(1).execute()
                print("✅ Supabase connection successful")
            except Exception as e:
                print(f"❌ Supabase connection failed: {e}")
                return False
        
        return True
    except Exception as e:
        if verbose:
            print(f"❌ Supabase configuration invalid: {e}")
        return False


def check_system_prompt(verbose: bool = False) -> bool:
    """Check if system_prompt.txt exists."""
    prompt_file = Path("system_prompt.txt")
    if not prompt_file.exists():
        if verbose:
            print("❌ system_prompt.txt not found")
        return False
    
    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        if not content:
            if verbose:
                print("❌ system_prompt.txt is empty")
            return False
        
        if verbose:
            print(f"✅ system_prompt.txt found ({len(content)} characters)")
        return True
    except Exception as e:
        if verbose:
            print(f"❌ Error reading system_prompt.txt: {e}")
        return False


def run_full_verification() -> bool:
    """Run complete configuration verification with detailed output."""
    print("🔧 ISST AI Tutor - Configuration Verification")
    print("=" * 50)
    
    checks = [
        ("Environment File", check_env_file),
        ("OpenAI Configuration", check_openai_config),
        ("Vector Store", check_vector_store),
        ("Supabase Configuration", check_supabase_config),
        ("System Prompt", check_system_prompt),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n🔍 Checking {name}...")
        try:
            result = check_func(verbose=True)
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} check failed with error: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {name}")
        if not passed:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All checks passed! Your configuration is ready.")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
    
    return all_passed


def check_startup_requirements() -> bool:
    """Check essential requirements for startup (fast, minimal output)."""
    print("🔍 Checking startup requirements...")
    
    essential_checks = [
        check_env_file,
        check_system_prompt,
        check_openai_config,
        check_vector_store,
        check_supabase_config
    ]
    
    failed_checks = []
    for i, check_func in enumerate(essential_checks):
        try:
            if not check_func(verbose=False):
                check_names = ["Environment File", "System Prompt", "OpenAI Config", "Vector Store", "Supabase Config"]
                failed_checks.append(check_names[i])
        except Exception:
            check_names = ["Environment File", "System Prompt", "OpenAI Config", "Vector Store", "Supabase Config"]
            failed_checks.append(check_names[i])
    
    if failed_checks:
        print("❌ Startup requirements failed:")
        for check in failed_checks:
            print(f"   - {check}")
        print("\n💡 Run with --verify flag for detailed diagnostics")
        return False
    
    print("✅ All startup requirements met")
    return True


def main() -> None:
    """Main function - handles both verification and startup modes."""
    
    # Check if running in verification mode
    if len(sys.argv) > 1 and sys.argv[1] == "--verify":
        print("🔧 Running in verification mode...\n")
        success = run_full_verification()
        if success:
            print("\n� You can now start the backend with: python start.py")
        else:
            print("\n💡 Fix the issues above before starting the backend")
        sys.exit(0 if success else 1)
    
    # Normal startup mode
    print("�🚀 Starting ISST AI Tutor Backend...")
    print("=" * 50)
    
    # Check startup requirements (fast, essential checks only)
    if not check_startup_requirements():
        print("\n💡 Run 'python start.py --verify' for detailed diagnostics")
        print("💡 Or check the README.md for setup instructions")
        sys.exit(1)
    
    print("🔧 Loading application...")
    
    try:
        # Import and run the application
        import uvicorn
        from app import app
        from config import get_settings
        
        settings = get_settings()
        
        print("✅ Application loaded successfully")
        print(f"🌐 Starting server on {settings.app_host}:{settings.app_port}")
        print(f"📊 Debug mode: {settings.debug}")
        
        # Use default log level if not defined in settings
        log_level = getattr(settings, 'log_level', 'info')
        print(f"📝 Log level: {log_level}")
        print("=" * 50)
        print("💡 For full configuration verification, run: python start.py --verify")
        print("=" * 50)
        
        # Start the server
        uvicorn.run(
            app, 
            host=settings.app_host, 
            port=settings.app_port,
            reload=settings.debug,
            log_level=log_level.lower()
        )
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Startup Error: {e}")
        print("💡 Check the logs for more details")
        print("💡 Run 'python start.py --verify' for detailed diagnostics")
        sys.exit(1)

if __name__ == "__main__":
    main()
