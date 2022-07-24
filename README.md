## NUnit test results visualiser

You can use this app on [GitHub Pages](https://boberoo.github.io/visualise-nunit-test-results/), or you can download the source and run it locally in your browser.

### Pre-requisites

Written in vanilla HTML/CSS/JavaScript, there are no dependencies in the source. You will however need a command line tool for running the unit tests to produce the TestResults in XML format.

### Generating the TestResults.XML file for your C# project

**Visual Studio** installs a command line tool called `MSTest`, and **dotnet core** can use the `dotnet test` command, but if you are using **Rider** you'll need to download a free tool, like [NUnit3 Console available on the NUnit downloads page](https://nunit.org/download/)

Sample Windows command that can be saved in a batch file to be re-run easily:

```
cd "C:\My Dev Folder\The Company\The Project\TheProject.Tests\bin\Debug\"

"C:\Program Files (x86)\NUnit.org\nunit-console\nunit3-console.exe" TheProject.Tests.dll --work=c:\Temp\6
```

This will place a file called `TestResults.XML` into `c:\Temp\`

### Usage

Copy and paste the contents of `TestResults.XML` into the memo of the visualiser app.

Tick the corresponding box if you would like to see
- Duration
- Number of Tests
- Number of Assertions
- Avg Test Duration

The visual representation makes it easier to spot tests that are significantly slower than the others for the amount of tests they are doing.
