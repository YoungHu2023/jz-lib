# Jiangzhou School Library

A static demonstration of the JZLib 2.0 reader site. Visitors enter the catalog as a sample reader. The interface opens in English and supports Simplified Chinese, light and dark appearances, and the device color scheme. The book titles are real. Shelf locations, loans, reservations, and account activity are sample data.

## Preview

Open `index.html` in a browser, or run `python -m http.server 8000 --bind 127.0.0.1` in this directory and visit `http://127.0.0.1:8000/`. Add `?lang=zh-CN` for a Chinese preview. Browser storage holds demonstration activity and preferences. The demo accepts no real credentials.

## GitHub Pages

1. Create a repository and copy the contents of this directory to the root of the `main` branch. Place `index.html` alongside `assets/`.
2. Open **Settings → Pages**. Choose **Deploy from a branch**, select **main** and **/(root)**, and save.
3. Open the site URL that GitHub displays after publication. Links and assets work under the repository's path. The demo runs entirely in the browser.

The Goetheanum typeface license accompanies the font in `assets/OFL-Goetheanum.txt`.

Catalog banner photo by Ɱ, cropped from [Wagnalls Memorial Library reading room](https://commons.wikimedia.org/wiki/File:Wagnalls_Memorial_Library_reading_room.jpg), [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).
