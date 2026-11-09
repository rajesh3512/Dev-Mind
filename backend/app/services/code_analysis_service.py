
class CodeAnalysisService:

    def count_lines(self, code: str) -> int:

        return len(code.splitlines())

    def count_characters(self, code: str) -> int:

        return len(code)

    def detect_language(self, language: str) -> str:

        supported_languages = [
            "Python",
            "Java",
            "C++",
            "JavaScript"
        ]

        if language in supported_languages:
            return language

        return "Unsupported language"

    def analyse_code(self, code: str, language: str) -> dict:

        response1 = self.count_lines(code)

        response2 = self.count_characters(code)

        response3 = self.detect_language(language)

        return {
            "language": response3,
            "lines": response1,
            "characters": response2,
            "status": "analysis_completed"
        }