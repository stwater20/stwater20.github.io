import unittest
import json
from unittest.mock import patch
from scripts.sync_resume import parse_resume, render, build_english


class IntroContactSyncTests(unittest.TestCase):
    def setUp(self):
        english_file = patch('scripts.sync_resume.EN_DATA_FILE')
        mock_file = english_file.start()
        self.addCleanup(english_file.stop)
        mock_file.read_text.return_value = json.dumps({
            'name': 'Sean', 'intro': ['English introduction.', 'English biography.'],
            'updated': '2026-11-27', 'sections': [{'title': 'Publications', 'from_zh': '著作'}]
        })

    def page(self, contact):
        return {"id": 31, "link": "https://sectools.tw/about/sean", "modified_gmt": "2026-11-27T02:29:28", "content": {"rendered":
            '<h2>Sean</h2><p>Name introduction.</p><p>Research biography.</p>' + contact +
            '<h2>著作</h2><p>Publications.</p>'}}

    def test_contact_survives_parse_and_bilingual_render(self):
        resume = parse_resume(self.page('<p>聯絡信箱：<a href="mailto:sean@example.com">sean@example.com</a></p>'))
        self.assertEqual(resume['intro'], ['Name introduction.', 'Research biography.'])
        self.assertEqual(resume['intro_links'][0]['label'], '聯絡信箱')
        english = build_english(resume)
        self.assertNotEqual(english['intro'], resume['intro'])
        self.assertEqual(english['intro_links'][0]['label'], 'Email')
        for lang, data in [('zh', resume), ('en', english)]:
            page = render(data, lang)
            self.assertEqual(page.count('href="mailto:sean@example.com"'), 1)
            self.assertNotIn('name="description" content="聯絡信箱', page)

    def test_contact_changes_and_removal_follow_source(self):
        for email in ['old@example.com', 'new@example.com']:
            resume = parse_resume(self.page(f'<p>Email: <a href="mailto:{email}">{email}</a></p>'))
            self.assertIn('mailto:' + email, render(build_english(resume), 'en'))
        resume = parse_resume(self.page(''))
        self.assertEqual(resume['intro_links'], [])
        self.assertNotIn('mailto:', render(build_english(resume), 'en'))

    def test_old_cached_data_without_contacts_still_renders(self):
        resume = parse_resume(self.page(''))
        del resume['intro_links']
        self.assertIn('Research biography.', render(resume, 'zh'))
        self.assertNotIn('mailto:', render(build_english(resume), 'en'))


if __name__ == '__main__':
    unittest.main()
