# trog

Log Analyzer CLI App
<div align="center">

![trog-log-demo](/assets/Trog_Log.gif)
![trog-find-demo](/assets/Trog_Find.gif)
![trog-tail-demo](/assets/Trog_Tail.gif)

</div>

# Install
npm i trog-cli

# Usage
## tail
trog tail [options] file

| Argument | Type | Description |
| --- | --- | --- |
| file | string | path to the file which tail will be performed |

| Param | Type | Description |
| --- | --- | --- |
| -n, --number-lines <value> | string | Number of lines to print to log. Default: 10 |
| -e, --encoding <value> | string | encooding of text to print. Default: utf8 |
| -f, --follow | null | Follow file for any additions. Default: false |
| -h or --help | null | Display help |

Description: Similar to normal tail. Tail a file.

## find

trog find [options] file searchText

| Argument | Type | Description |
| --- | --- | --- |
| file | string | path to the file which find will be performed |
| searchText | string | desired text to be found in file |

| Param | Type | Description |
| --- | --- | --- |
| -A, --After-value <value> | string | number of lines to print before occurance of desired find. Default: 5 |
| -B, --Before-value <value> | string | number of lines to print after occurance of desired find. Default: 5 |
| -h or --help | null | Display help |

Description: Opens interactive window with all the finds in a file. User can jump between next and previous using
'n' and 'p' keys and scroll up and down.

## log

trog log [options] file

| Argument | Type | Description |
| --- | --- | --- |
| file | string | path to the file which log will be performed |

| Param | Type | Description |
| --- | --- | --- |
| -e, --encoding <value> | string | encooding of text to print. Default: utf8|
| -h or --help | null | Display help |

Description: Interactive view of watching any changes to file with Filter and Highlight.
Filter and Highlight accept REGEX.
